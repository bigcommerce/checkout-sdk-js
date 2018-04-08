import { omit } from 'lodash';

import { Payment, PaymentMethodActionCreator } from '../..';
import { CheckoutSelectors, CheckoutStore } from '../../../checkout';
import { MissingDataError, StandardError } from '../../../common/error/errors';
import { OrderRequestBody, PlaceOrderService } from '../../../order';
import isCreditCardLike from '../../is-credit-card';
import isVaultedInstrument from '../../is-vaulted-instrument';
import { PaymentInstrument } from '../../payment';
import PaymentStrategy from '../payment-strategy';

import BraintreePaymentProcessor, { BraintreeCreditCardInitializeOptions } from './braintree-payment-processor';

export default class BraintreeCreditCardPaymentStrategy extends PaymentStrategy {
    private _is3dsEnabled?: boolean;

    constructor(
        store: CheckoutStore,
        placeOrderService: PlaceOrderService,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _braintreePaymentProcessor: BraintreePaymentProcessor
    ) {
        super(store, placeOrderService);
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
        const { payment, useStoreCredit } = orderRequest;
        const { checkout } = this._store.getState();

        return this._placeOrderService
            .submitOrder(omit(orderRequest, 'payment'), true, options)
            .then(() =>
                checkout.isPaymentDataRequired(useStoreCredit) ?
                    this._preparePaymentData(payment) :
                    Promise.resolve(payment)
            )
            .then((processedPayment: PaymentInstrument) =>
                this._placeOrderService.submitPayment(processedPayment, useStoreCredit, options)
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
