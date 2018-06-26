import { CheckoutStore, CheckoutValidator, InternalCheckoutSelectors } from '../../checkout';
import { MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType } from '../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../order';
import { RemoteCheckoutActionCreator } from '../../remote-checkout';
import { AfterpayScriptLoader, AfterpaySdk } from '../../remote-checkout/methods/afterpay';
import { PaymentArgumentInvalidError } from '../errors';
import PaymentActionCreator from '../payment-action-creator';
import PaymentMethod from '../payment-method';
import PaymentMethodActionCreator from '../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../payment-request-options';

import PaymentStrategy from './payment-strategy';

export default class AfterpayPaymentStrategy extends PaymentStrategy {
    private _afterpaySdk?: AfterpaySdk;

    constructor(
        store: CheckoutStore,
        private _checkoutValidator: CheckoutValidator,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _remoteCheckoutActionCreator: RemoteCheckoutActionCreator,
        private _afterpayScriptLoader: AfterpayScriptLoader
    ) {
        super(store);
    }

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        if (this._isInitialized) {
            return super.initialize(options);
        }

        const state = this._store.getState();
        const paymentMethod = state.paymentMethods.getPaymentMethod(options.methodId, options.gatewayId);
        const config = state.config.getStoreConfig();
        const storeCountryName = config ? config.storeProfile.storeCountry : '';

        if (!paymentMethod) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        return this._afterpayScriptLoader.load(paymentMethod, this._mapCountryToISO2(storeCountryName))
            .then(afterpaySdk => {
                this._afterpaySdk = afterpaySdk;
            })
            .then(() => super.initialize(options));
    }

    deinitialize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        if (!this._isInitialized) {
            return super.deinitialize(options);
        }

        if (this._afterpaySdk) {
            this._afterpaySdk = undefined;
        }

        return super.deinitialize(options);
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const paymentId = payload.payment && payload.payment.gatewayId;

        if (!paymentId) {
            throw new PaymentArgumentInvalidError(['payment.gatewayId']);
        }

        const useStoreCredit = !!payload.useStoreCredit;
        const customerMessage = payload.customerMessage ? payload.customerMessage : '';
        const state = this._store.getState();
        const config = state.config.getStoreConfig();
        const storeCountryName = config ? config.storeProfile.storeCountry : '';

        return this._store.dispatch(
            this._remoteCheckoutActionCreator.initializePayment(paymentId, { useStoreCredit, customerMessage })
        )
            .then(state => this._checkoutValidator.validate(state.checkout.getCheckout(), options))
            .then(() => this._store.dispatch(
                this._paymentMethodActionCreator.loadPaymentMethod(paymentId, options)
            ))
            .then(state => this._displayModal(storeCountryName, state.paymentMethods.getPaymentMethod(paymentId)))
            // Afterpay will handle the rest of the flow so return a promise that doesn't really resolve
            .then(() => new Promise<never>(() => {}));
    }

    finalize(options: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(this._remoteCheckoutActionCreator.loadSettings(options.methodId))
            .then(state => {
                const payment = state.payment.getPaymentId();
                const config = state.config.getContextConfig();
                const afterpay = state.remoteCheckout.getCheckout('afterpay');

                if (!payment) {
                    throw new MissingDataError(MissingDataErrorType.MissingCheckout);
                }

                if (!config || !config.payment.token) {
                    throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
                }

                if (!afterpay || !afterpay.settings) {
                    throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
                }

                const orderPayload = {
                    useStoreCredit: afterpay.settings.useStoreCredit,
                    customerMessage: afterpay.settings.customerMessage,
                };

                const paymentPayload = {
                    methodId: payment.providerId,
                    paymentData: { nonce: config.payment.token },
                };

                return this._store.dispatch(this._orderActionCreator.submitOrder(orderPayload, options))
                    .then(() => this._store.dispatch(this._paymentActionCreator.submitPayment(paymentPayload)));
            });
    }

    private _displayModal(countryName: string, paymentMethod?: PaymentMethod): void {
        if (!this._afterpaySdk || !paymentMethod || !paymentMethod.clientToken) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        this._afterpaySdk.initialize({ countryCode: this._mapCountryToISO2(countryName)});
        this._afterpaySdk.display({ token: paymentMethod.clientToken });
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
