import { omit } from 'lodash';

import { Payment } from '../..';
import { CheckoutSelectors, CheckoutStore } from '../../../checkout';
import { StandardError } from '../../../common/error/errors';
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
        private _braintreePaymentProcessor: BraintreePaymentProcessor
    ) {
        super(store, placeOrderService);
    }

    initialize(options: BraintreeCreditCardInitializeOptions): Promise<CheckoutSelectors> {
        const { id: paymentId } = options.paymentMethod;

        return this._placeOrderService.loadPaymentMethod(paymentId)
            .then(({ checkout }: CheckoutSelectors) => {
                const { clientToken, config } = checkout.getPaymentMethod(paymentId);
                this._braintreePaymentProcessor.initialize(clientToken, options);
                this._is3dsEnabled = config.is3dsEnabled;

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

    private _handleError(error: Error): void {
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

        const { amount } = checkout.getCart().grandTotal;
        const billingAddress = checkout.getBillingAddress();

        const tokenizedCard = this._is3dsEnabled ?
            this._braintreePaymentProcessor.verifyCard(payment, billingAddress, amount) :
            this._braintreePaymentProcessor.tokenizeCard(payment, billingAddress);

        return this._braintreePaymentProcessor.appendSessionId(tokenizedCard)
            .then((paymentData) => ({ ...payment, paymentData }));
    }
}
