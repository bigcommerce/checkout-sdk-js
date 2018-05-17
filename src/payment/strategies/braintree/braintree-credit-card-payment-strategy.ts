import { Payment, PaymentMethodActionCreator } from '../..';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, StandardError } from '../../../common/error/errors';
import { OrderActionCreator, OrderPaymentRequestBody, OrderRequestBody } from '../../../order';
import isCreditCardLike from '../../is-credit-card-like';
import isVaultedInstrument from '../../is-vaulted-instrument';
import { PaymentInstrument } from '../../payment';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import BraintreePaymentProcessor from './braintree-payment-processor';

export default class BraintreeCreditCardPaymentStrategy extends PaymentStrategy {
    private _is3dsEnabled?: boolean;

    constructor(
        store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _braintreePaymentProcessor: BraintreePaymentProcessor
    ) {
        super(store);
    }

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(options.methodId))
            .then(state => {
                const paymentMethod = state.paymentMethods.getPaymentMethod(options.methodId);

                if (!paymentMethod || !paymentMethod.clientToken) {
                    throw new MissingDataError('Unable to initialize because "paymentMethod.clientToken" field is missing.');
                }

                this._braintreePaymentProcessor.initialize(paymentMethod.clientToken, options.braintree);
                this._is3dsEnabled = paymentMethod.config.is3dsEnabled;

                return super.initialize(options);
            })
            .catch((error: Error) => this._handleError(error));
    }

    execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = orderRequest;

        if (!payment) {
            throw new InvalidArgumentError('Unable to submit payment because "payload.payment" argument is not provided.');
        }

        return this._store.dispatch(
            this._orderActionCreator.submitOrder(order, options)
        )
            .then(state =>
                state.order.isPaymentDataRequired(order.useStoreCredit) && payment ?
                    this._preparePaymentData(payment) :
                    Promise.resolve(payment as Payment)
            )
            .then(payment =>
                this._store.dispatch(this._paymentActionCreator.submitPayment(payment))
            )
            .catch((error: Error) => this._handleError(error));
    }

    deinitialize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        return this._braintreePaymentProcessor.deinitialize()
            .then(() => super.deinitialize(options));
    }

    private _handleError(error: Error): never {
        if (error.name === 'BraintreeError') {
            throw new StandardError(error.message);
        }

        throw error;
    }

    private _isUsingVaulting(paymentData: PaymentInstrument): boolean {
        if (isCreditCardLike(paymentData)) {
            return Boolean(paymentData.shouldSaveInstrument);
        }

        return isVaultedInstrument(paymentData);
    }

    private _preparePaymentData(payment: OrderPaymentRequestBody): Promise<Payment> {
        const { paymentData } = payment;
        const state = this._store.getState();

        if (paymentData && this._isUsingVaulting(paymentData)) {
            return Promise.resolve(payment as Payment);
        }

        const cart = state.cart.getCart();
        const billingAddress = state.billingAddress.getBillingAddress();

        if (!cart || !billingAddress) {
            throw new MissingDataError('Unable to prepare payment data because "cart" and "billingAddress" data is missing.');
        }

        const tokenizedCard = this._is3dsEnabled ?
            this._braintreePaymentProcessor.verifyCard(payment, billingAddress, cart.grandTotal.amount) :
            this._braintreePaymentProcessor.tokenizeCard(payment, billingAddress);

        return this._braintreePaymentProcessor.appendSessionId(tokenizedCard)
            .then(paymentData => ({ ...payment, paymentData }));
    }
}
