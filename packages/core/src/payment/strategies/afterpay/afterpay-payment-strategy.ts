import { CheckoutStore, CheckoutValidator, InternalCheckoutSelectors } from '../../../checkout';
import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
    RequestError,
} from '../../../common/error/errors';
import { RequestOptions } from '../../../common/http-request';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotCompletedError } from '../../../order/errors';
import { RemoteCheckoutRequestSender } from '../../../remote-checkout';
import { StoreCreditActionCreator } from '../../../store-credit';
import { PaymentArgumentInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import AfterpayScriptLoader from './afterpay-script-loader';
import AfterpaySdk from './afterpay-sdk';

export default class AfterpayPaymentStrategy implements PaymentStrategy {
    private _afterpaySdk?: AfterpaySdk;

    constructor(
        private _store: CheckoutStore,
        private _checkoutValidator: CheckoutValidator,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _remoteCheckoutRequestSender: RemoteCheckoutRequestSender,
        private _storeCreditActionCreator: StoreCreditActionCreator,
        private _afterpayScriptLoader: AfterpayScriptLoader,
    ) {}

    async initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const state = this._store.getState();
        const paymentMethod = state.paymentMethods.getPaymentMethod(
            options.methodId,
            options.gatewayId,
        );
        const currencyCode = state.cart.getCart()?.currency.code || '';
        const countryCode = this._mapCurrencyToISO2(currencyCode);

        if (!paymentMethod) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this._afterpaySdk = await this._afterpayScriptLoader.load(paymentMethod, countryCode);

        return this._store.getState();
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        if (this._afterpaySdk) {
            this._afterpaySdk = undefined;
        }

        return Promise.resolve(this._store.getState());
    }

    async execute(
        payload: OrderRequestBody,
        options?: PaymentRequestOptions,
    ): Promise<InternalCheckoutSelectors> {
        if (!payload.payment) {
            throw new PaymentArgumentInvalidError(['payment.gatewayId', 'payment.methodId']);
        }

        const { gatewayId, methodId } = payload.payment;

        if (!gatewayId || !methodId) {
            throw new PaymentArgumentInvalidError(['payment.gatewayId', 'payment.methodId']);
        }

        let state = this._store.getState();
        const currencyCode = state.cart.getCart()?.currency.code || '';
        const countryCode = this._mapCurrencyToISO2(currencyCode);
        const { useStoreCredit } = payload;

        if (useStoreCredit !== undefined) {
            state = await this._store.dispatch(
                this._storeCreditActionCreator.applyStoreCredit(useStoreCredit),
            );
        }

        await this._checkoutValidator.validate(state.checkout.getCheckout(), options);

        state = await this._loadPaymentMethod(gatewayId, methodId, options);

        await this._redirectToAfterpay(
            countryCode,
            state.paymentMethods.getPaymentMethod(methodId, gatewayId),
        );

        // Afterpay will handle the rest of the flow so return a promise that doesn't really resolve
        return new Promise<never>(() => {});
    }

    async finalize(options: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const state = this._store.getState();
        const payment = state.payment.getPaymentId();
        const config = state.config.getContextConfig();

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

        await this._store.dispatch(this._orderActionCreator.submitOrder({}, options));

        try {
            return await this._store.dispatch(
                this._paymentActionCreator.submitPayment(paymentPayload),
            );
        } catch (error) {
            await this._remoteCheckoutRequestSender.forgetCheckout();
            await this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethods());

            throw new OrderFinalizationNotCompletedError(error.body?.errors?.[0]?.message);
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
    ): Promise<InternalCheckoutSelectors> {
        try {
            return await this._store.dispatch(
                this._paymentMethodActionCreator.loadPaymentMethod(gatewayId, {
                    ...options,
                    params: { ...options?.params, method: methodId },
                }),
            );
        } catch (error) {
            if (error instanceof RequestError && error.body?.status === 422) {
                throw new InvalidArgumentError(
                    "Afterpay can't process your payment for this order, please try another payment method",
                );
            }

            throw error;
        }
    }
}
