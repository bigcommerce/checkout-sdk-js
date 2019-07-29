import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';
import { OrderActionCreator, OrderPaymentRequestBody, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError, PaymentMethodCancelledError, PaymentMethodFailedError } from '../../errors';
import Payment from '../../payment';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import { BraintreeError } from './braintree';
import BraintreePaymentProcessor from './braintree-payment-processor';
import isBraintreeError from './is-braintree-error';

export default class BraintreePaypalPaymentStrategy implements PaymentStrategy {
    private _paymentMethod?: PaymentMethod;

    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _braintreePaymentProcessor: BraintreePaymentProcessor,
        private _credit: boolean = false
    ) {}

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { braintree: braintreeOptions, methodId } = options;

        this._paymentMethod = this._store.getState().paymentMethods.getPaymentMethod(methodId);

        if (this._paymentMethod && this._paymentMethod.nonce) {
            return Promise.resolve(this._store.getState());
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
            .then(() => this._store.getState())
            .catch((error: Error) => this._handleError(error));
    }

    execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = orderRequest;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        return (payment ? this._preparePaymentData(payment, order.useStoreCredit) : Promise.resolve(payment))
            .then(payment => Promise.all([payment, this._store.dispatch(this._orderActionCreator.submitOrder(order, options))]))
            .then(([payment]) => this._store.dispatch(this._paymentActionCreator.submitPayment(payment)))
            .catch((error: Error) => this._handleError(error));
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        return this._braintreePaymentProcessor.deinitialize()
            .then(() => this._store.getState());
    }

    private _handleError(error: BraintreeError | Error): never {
        if (!isBraintreeError(error)) {
            throw error;
        }

        if (error.code === 'PAYPAL_POPUP_CLOSED') {
            throw new PaymentMethodCancelledError(error.message);
        }

        throw new PaymentMethodFailedError(error.message);
    }

    private _preparePaymentData(payment: OrderPaymentRequestBody, useStoreCredit?: boolean): Promise<Payment> {
        const state = this._store.getState();
        const grandTotal = state.checkout.getOutstandingBalance(useStoreCredit);
        const config = state.config.getStoreConfig();

        if (!grandTotal) {
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
            .paypal(grandTotal, storeLanguage, currency.code, this._credit);

        return this._braintreePaymentProcessor.appendSessionId(tokenizedCard)
            .then(paymentData => ({ ...payment, paymentData: { ...paymentData, method } }));
    }
}
