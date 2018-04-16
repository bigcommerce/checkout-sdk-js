import { Payment, PaymentMethodActionCreator } from '../..';
import { CheckoutSelectors, CheckoutStore } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, StandardError } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import isCreditCardLike from '../../is-credit-card';
import isVaultedInstrument from '../../is-vaulted-instrument';
import { PaymentInstrument } from '../../payment';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentStrategy from '../payment-strategy';

import BraintreePaymentProcessor, { BraintreeCreditCardInitializeOptions } from './braintree-payment-processor';

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

    initialize(options: BraintreeCreditCardInitializeOptions): Promise<CheckoutSelectors> {
        const { id: paymentId } = options.paymentMethod;

        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(paymentId))
            .then(({ checkout }) => {
                this._paymentMethod = checkout.getPaymentMethod(paymentId);

                if (!this._paymentMethod || !this._paymentMethod.clientToken) {
                    throw new MissingDataError('Unable to initialize because "paymentMethod.clientToken" field is missing.');
                }

                this._braintreePaymentProcessor.initialize(this._paymentMethod.clientToken, options);
                this._is3dsEnabled = this._paymentMethod.config.is3dsEnabled;

                return super.initialize(options);
            })
            .catch((error: Error) => this._handleError(error));
    }

    execute(orderRequest: OrderRequestBody, options?: any): Promise<CheckoutSelectors> {
        const { payment, ...order } = orderRequest;
        const { checkout } = this._store.getState();

        if (!payment) {
            throw new InvalidArgumentError('Unable to submit payment because "payload.payment" argument is not provided.');
        }

        return this._store.dispatch(
            this._orderActionCreator.submitOrder(order, true, options)
        )
            .then(() =>
                checkout.isPaymentDataRequired(order.useStoreCredit) && payment ?
                    this._preparePaymentData(payment) :
                    Promise.resolve(payment)
            )
            .then(payment =>
                this._store.dispatch(this._paymentActionCreator.submitPayment(payment))
            )
            .catch((error: Error) => this._handleError(error));
    }

    deinitialize(options: any): Promise<CheckoutSelectors> {
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

    private _preparePaymentData(payment: Payment): Promise<Payment> {
        const { paymentData } = payment;
        const { checkout } = this._store.getState();

        if (paymentData && this._isUsingVaulting(paymentData)) {
            return Promise.resolve(payment);
        }

        const cart = checkout.getCart();
        const billingAddress = checkout.getBillingAddress();

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
