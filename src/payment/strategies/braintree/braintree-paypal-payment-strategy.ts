import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType, StandardError } from '../../../common/error/errors';
import { OrderActionCreator, OrderPaymentRequestBody, OrderRequestBody } from '../../../order';
import { PaymentArgumentInvalidError } from '../../errors';
import Payment from '../../payment';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import BraintreePaymentProcessor from './braintree-payment-processor';

export default class BraintreePaypalPaymentStrategy extends PaymentStrategy {
    private _paymentMethod?: PaymentMethod;

    constructor(
        store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _braintreePaymentProcessor: BraintreePaymentProcessor,
        private _credit: boolean = false
    ) {
        super(store);
    }

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { braintree: braintreeOptions, methodId } = options;

        this._paymentMethod = this._store.getState().paymentMethods.getPaymentMethod(methodId);

        if (this._paymentMethod && this._paymentMethod.nonce) {
            return super.initialize(options);
        }

        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId))
            .then(state => {
                this._paymentMethod = state.paymentMethods.getPaymentMethod(methodId);

                if (!this._paymentMethod || !this._paymentMethod.clientToken) {
                    throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                }

                this._braintreePaymentProcessor.initialize(this._paymentMethod.clientToken, braintreeOptions);

                return this._braintreePaymentProcessor.preloadPaypal();
            })
            .then(() => super.initialize(options))
            .catch((error: Error) => this._handleError(error));
    }

    execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = orderRequest;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        return Promise.all([
                payment ? this._preparePaymentData(payment) : Promise.resolve(payment),
                this._store.dispatch(this._orderActionCreator.submitOrder(order, options)),
            ])
            .then(([payment]) =>
                this._store.dispatch(this._paymentActionCreator.submitPayment(payment))
            )
            .catch((error: Error) => this._handleError(error));
    }

    deinitialize(options: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        return this._braintreePaymentProcessor.deinitialize()
            .then(() => super.deinitialize(options));
    }

    private _handleError(error: Error): never {
        if (error.name === 'BraintreeError') {
            throw new StandardError(error.message);
        }

        throw error;
    }

    private _preparePaymentData(payment: OrderPaymentRequestBody): Promise<Payment> {
        const state = this._store.getState();
        const checkout = state.checkout.getCheckout();
        const config = state.config.getStoreConfig();

        if (!checkout) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckout);
        }

        if (!config) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
        }

        if (!this._paymentMethod) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const { currency, storeProfile: { storeLanguage } } = config;
        const { method, nonce } = this._paymentMethod;

        if (nonce) {
            return Promise.resolve({ ...payment, paymentData: { nonce, method } });
        }

        const tokenizedCard = this._braintreePaymentProcessor
            .paypal(checkout.grandTotal, storeLanguage, currency.code, this._credit);

        return this._braintreePaymentProcessor.appendSessionId(tokenizedCard)
            .then(paymentData => ({ ...payment, paymentData: { ...paymentData, method } }));
    }
}
