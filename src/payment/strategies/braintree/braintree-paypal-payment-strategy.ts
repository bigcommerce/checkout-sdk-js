import { CheckoutSelectors, CheckoutStore } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, StandardError } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
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

    initialize(options: PaymentInitializeOptions): Promise<CheckoutSelectors> {
        const { braintree: braintreeOptions, methodId } = options;
        const { nonce } = this._store.getState().checkout.getPaymentMethod(methodId) || { nonce: undefined };

        if (nonce) {
            return super.initialize(options);
        }

        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId))
            .then(({ checkout }: CheckoutSelectors) => {
                this._paymentMethod = checkout.getPaymentMethod(methodId);

                if (!this._paymentMethod || !this._paymentMethod.clientToken) {
                    throw new MissingDataError('Unable to initialize because "paymentMethod.clientToken" field is missing.');
                }

                this._braintreePaymentProcessor.initialize(this._paymentMethod.clientToken, braintreeOptions);

                return this._braintreePaymentProcessor.preloadPaypal();
            })
            .then(() => super.initialize(options))
            .catch((error: Error) => this._handleError(error));
    }

    execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<CheckoutSelectors> {
        const { payment, ...order } = orderRequest;

        if (!payment) {
            throw new InvalidArgumentError('Unable to submit payment because "payload.payment" argument is not provided.');
        }

        return Promise.all([
                payment ? this._preparePaymentData(payment) : Promise.resolve(payment),
                this._store.dispatch(this._orderActionCreator.submitOrder(order, true, options)),
            ])
            .then(([payment]) =>
                this._store.dispatch(this._paymentActionCreator.submitPayment(payment))
            )
            .catch((error: Error) => this._handleError(error));
    }

    deinitialize(options: PaymentRequestOptions): Promise<CheckoutSelectors> {
        return this._braintreePaymentProcessor.deinitialize()
            .then(() => super.deinitialize(options));
    }

    private _handleError(error: Error): never {
        if (error.name === 'BraintreeError') {
            throw new StandardError(error.message);
        }

        throw error;
    }

    private _preparePaymentData(payment: Payment): Promise<Payment> {
        const { checkout } = this._store.getState();
        const cart = checkout.getCart();
        const config = checkout.getConfig();

        if (!cart || !config || !this._paymentMethod) {
            throw new MissingDataError(`Unable to prepare payment data because "cart", "config" or "paymentMethod (${payment.name})" data is missing.`);
        }

        const { amount } = cart.grandTotal;
        const { currency, storeLanguage } = config;
        const { method, nonce } = this._paymentMethod;

        if (nonce) {
            return Promise.resolve({ ...payment, paymentData: { nonce, method } });
        }

        const tokenizedCard = this._braintreePaymentProcessor
            .paypal(amount, storeLanguage, currency.code, this._credit);

        return this._braintreePaymentProcessor.appendSessionId(tokenizedCard)
            .then(paymentData => ({ ...payment, paymentData: { ...paymentData, method } }));
    }
}
