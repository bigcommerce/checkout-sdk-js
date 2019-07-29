import { CheckoutStore, CheckoutValidator, InternalCheckoutSelectors } from '../../../checkout';
import { MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
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
        private _storeCreditActionCreator: StoreCreditActionCreator,
        private _afterpayScriptLoader: AfterpayScriptLoader
    ) {}

    async initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const state = this._store.getState();
        const paymentMethod = state.paymentMethods.getPaymentMethod(options.methodId, options.gatewayId);
        const config = state.config.getStoreConfig();
        const storeCountryName = config ? config.storeProfile.storeCountry : '';

        if (!paymentMethod) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this._afterpaySdk = await this._afterpayScriptLoader.load(paymentMethod, this._mapCountryToISO2(storeCountryName));

        return this._store.getState();
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        if (this._afterpaySdk) {
            this._afterpaySdk = undefined;
        }

        return Promise.resolve(this._store.getState());
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const paymentId = payload.payment && payload.payment.gatewayId;

        if (!paymentId) {
            throw new PaymentArgumentInvalidError(['payment.gatewayId']);
        }

        let state = this._store.getState();
        const config = state.config.getStoreConfig();
        const storeCountryName = config ? config.storeProfile.storeCountry : '';
        const { useStoreCredit } = payload;

        if (useStoreCredit !== undefined) {
            state = await this._store.dispatch(
                this._storeCreditActionCreator.applyStoreCredit(useStoreCredit)
            );
        }

        await this._checkoutValidator.validate(state.checkout.getCheckout(), options);

        state = await this._store.dispatch(
            this._paymentMethodActionCreator.loadPaymentMethod(paymentId, options)
        );

        await this._redirectToAfterpay(storeCountryName, state.paymentMethods.getPaymentMethod(paymentId));

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

        return this._store.dispatch(this._paymentActionCreator.submitPayment(paymentPayload));
    }

    private _redirectToAfterpay(countryName: string, paymentMethod?: PaymentMethod): void {
        if (!this._afterpaySdk || !paymentMethod || !paymentMethod.clientToken) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        this._afterpaySdk.initialize({ countryCode: this._mapCountryToISO2(countryName)});
        this._afterpaySdk.redirect({ token: paymentMethod.clientToken });
    }

    private _mapCountryToISO2(countryName: string): string {
        switch (countryName) {
        case 'Australia':
            return 'AU';

        case 'New Zealand':
            return 'NZ';

        case 'United States':
            return 'US';

        default:
            return 'AU';
        }
    }
}
