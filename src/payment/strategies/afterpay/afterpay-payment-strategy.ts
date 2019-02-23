import { CheckoutStore, CheckoutValidator, InternalCheckoutSelectors } from '../../../checkout';
import { MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { RemoteCheckoutActionCreator } from '../../../remote-checkout';
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
        private _remoteCheckoutActionCreator: RemoteCheckoutActionCreator,
        private _afterpayScriptLoader: AfterpayScriptLoader
    ) {
        this._store.subscribe(state => {console.log('new', state)});
    }

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
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
            .then(() => this._store.getState());
    }

    deinitialize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        if (this._afterpaySdk) {
            this._afterpaySdk = undefined;
        }

        return Promise.resolve(this._store.getState());
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const paymentId = payload.payment && payload.payment.gatewayId;

        if (!paymentId) {
            throw new PaymentArgumentInvalidError(['payment.gatewayId']);
        }

        const useStoreCredit = !!payload.useStoreCredit;
        const state = this._store.getState();
        const config = state.config.getStoreConfig();
        const storeCountryName = config ? config.storeProfile.storeCountry : '';

        return this._store.dispatch(
            this._remoteCheckoutActionCreator.initializePayment(paymentId, { useStoreCredit })
        )
            .then(state => {
                console.log(options);
                console.log(state); 
                (<any>window).state = state; 
                return this._checkoutValidator.validate(state.checkout.getCheckout(), options)})
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
                console.log('state', state);
                (<any>window).state = state;

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
