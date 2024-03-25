import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
    OrderFinalizationNotCompletedError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationSelectors,
    PaymentIntegrationService,
    PaymentMethod,
    PaymentRequestOptions,
    PaymentStrategy,
    RequestError,
    RequestOptions,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import AfterpayScriptLoader from './afterpay-script-loader';
import AfterpaySdk from './afterpay-sdk';

export default class AfterpayPaymentStrategy implements PaymentStrategy {
    private _afterpaySdk?: AfterpaySdk;

    constructor(
        private _paymentIntegrationService: PaymentIntegrationService,
        private _afterpayScriptLoader: AfterpayScriptLoader,
    ) {}

    async initialize(options: PaymentInitializeOptions): Promise<void> {
        const state = this._paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethod(options.methodId, options.gatewayId);
        const currencyCode = state.getCart()?.currency.code || '';
        const countryCode = this._mapCurrencyToISO2(currencyCode);

        if (!paymentMethod) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this._afterpaySdk = await this._afterpayScriptLoader.load(paymentMethod, countryCode);
    }

    deinitialize(): Promise<void> {
        if (this._afterpaySdk) {
            this._afterpaySdk = undefined;
        }

        return Promise.resolve();
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        if (!payload.payment) {
            throw new PaymentArgumentInvalidError(['payment.gatewayId', 'payment.methodId']);
        }

        const { gatewayId, methodId } = payload.payment;

        if (!gatewayId || !methodId) {
            throw new PaymentArgumentInvalidError(['payment.gatewayId', 'payment.methodId']);
        }

        let state = this._paymentIntegrationService.getState();
        const currencyCode = state.getCart()?.currency.code || '';
        const countryCode = this._mapCurrencyToISO2(currencyCode);
        const { useStoreCredit } = payload;

        if (useStoreCredit !== undefined) {
            await this._paymentIntegrationService.applyStoreCredit(useStoreCredit);
        }

        await this._loadPaymentMethod(gatewayId, methodId, options);

        state = this._paymentIntegrationService.getState();

        this._redirectToAfterpay(countryCode, state.getPaymentMethod(methodId, gatewayId));

        // Afterpay will handle the rest of the flow so return a promise that doesn't really resolve
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return new Promise<never>(() => {});
    }

    async finalize(options: PaymentRequestOptions): Promise<void> {
        const state = this._paymentIntegrationService.getState();
        const payment = state.getPaymentId();
        const config = state.getContextConfig();

        if (!payment) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckout);
        }

        if (!config || !config.payment.token) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
        }

        const paymentPayload = {
            methodId: payment.providerId,
            paymentData: { nonce: config.payment.token },
        };

        await this._paymentIntegrationService.submitOrder({}, options);

        try {
            await this._paymentIntegrationService.submitPayment(paymentPayload);
        } catch (error) {
            await this._paymentIntegrationService.forgetCheckout(payment.providerId);
            // TODO
            // await this._paymentIntegrationService.loadPaymentMethods();

            throw new OrderFinalizationNotCompletedError();
        }
    }

    private _redirectToAfterpay(countryCode: string, paymentMethod?: PaymentMethod): void {
        if (!this._afterpaySdk || !paymentMethod || !paymentMethod.clientToken) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        this._afterpaySdk.initialize({ countryCode });
        this._afterpaySdk.redirect({ token: paymentMethod.clientToken });
    }

    private _mapCurrencyToISO2(currencyCode: string): string {
        const countryByCurrency: { [key: string]: string } = {
            AUD: 'AU',
            NZD: 'NZ',
            CAD: 'CA',
            USD: 'US',
        };

        return countryByCurrency[currencyCode] || 'AU';
    }

    private async _loadPaymentMethod(
        gatewayId: string,
        methodId: string,
        options?: RequestOptions,
    ): Promise<PaymentIntegrationSelectors> {
        try {
            return await this._paymentIntegrationService.loadPaymentMethod(gatewayId, {
                ...options,
                params: { ...options?.params, method: methodId },
            });
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (error instanceof RequestError && error.body?.status === 422) {
                throw new InvalidArgumentError(
                    "Afterpay can't process your payment for this order, please try another payment method",
                );
            }

            throw error;
        }
    }
}
