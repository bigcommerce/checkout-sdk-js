import { noop } from 'lodash';

import {
    InvalidArgumentError,
    isRequestError,
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

import ClearpayScriptLoader from './clearpay-script-loader';
import ClearpaySdk from './clearpay-sdk';

export default class ClearpayPaymentStrategy implements PaymentStrategy {
    private _clearpaySdk?: ClearpaySdk;

    constructor(
        private _paymentIntegrationService: PaymentIntegrationService,
        private _clearpayScriptLoader: ClearpayScriptLoader,
    ) {}

    async initialize(options: PaymentInitializeOptions): Promise<void> {
        const { getPaymentMethodOrThrow } = this._paymentIntegrationService.getState();
        const paymentMethod = getPaymentMethodOrThrow(options.methodId, options.gatewayId);

        this._clearpaySdk = await this._clearpayScriptLoader.load(paymentMethod);
    }

    deinitialize(): Promise<void> {
        this._clearpaySdk = undefined;

        return Promise.resolve();
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { gatewayId, methodId } = payload.payment || {};

        if (!gatewayId || !methodId) {
            throw new PaymentArgumentInvalidError(['payment.gatewayId', 'payment.methodId']);
        }

        const state = this._paymentIntegrationService.getState();
        const { isStoreCreditApplied: useStoreCredit } = state.getCheckoutOrThrow();

        await this._paymentIntegrationService.applyStoreCredit(useStoreCredit);

        await this._paymentIntegrationService.validateCheckout(state.getCheckout(), options);

        const { countryCode } = state.getBillingAddressOrThrow();

        if (!this._isCountrySupported(countryCode)) {
            throw new InvalidArgumentError(
                'Unable to proceed because billing country is not supported.',
            );
        }

        await this._loadPaymentMethod(gatewayId, methodId, options);

        await this._redirectToClearpay(
            countryCode,
            this._paymentIntegrationService.getState().getPaymentMethod(methodId, gatewayId),
        );

        // Clearpay will handle the rest of the flow so return a promise that doesn't really resolve
        return new Promise(noop);
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
            await this._paymentIntegrationService.loadPaymentMethods();

            if (isRequestError(error)) {
                throw new OrderFinalizationNotCompletedError(error.body?.errors?.[0]?.message);
            }
        }
    }

    private async _redirectToClearpay(
        countryCode: string,
        paymentMethod?: PaymentMethod,
    ): Promise<void> {
        if (!this._clearpaySdk || !paymentMethod || !paymentMethod.clientToken) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        this._clearpaySdk.initialize({ countryCode });
        this._clearpaySdk.redirect({ token: paymentMethod.clientToken });

        return Promise.resolve();
    }

    private _isCountrySupported(countryCode: string): boolean {
        return countryCode === 'GB';
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
            if (error instanceof RequestError && error.body?.status === 422) {
                throw new InvalidArgumentError(
                    "Clearpay can't process your payment for this order, please try another payment method",
                );
            }

            throw error;
        }
    }
}
