import { omit } from 'lodash';

import { CheckoutSelectors, CheckoutStore } from '../../../checkout';
import { StandardError } from '../../../common/error/errors';
import { OrderRequestBody, PlaceOrderService } from '../../../order';
import Payment from '../../payment';
import PaymentStrategy, { InitializeOptions } from '../payment-strategy';

import BraintreePaymentProcessor from './braintree-payment-processor';

export default class BraintreePaypalPaymentStrategy extends PaymentStrategy {
    constructor(
        store: CheckoutStore,
        placeOrderService: PlaceOrderService,
        private _braintreePaymentProcessor: BraintreePaymentProcessor,
        private _credit: boolean = false
    ) {
        super(store, placeOrderService);
    }

    initialize(options: InitializeOptions): Promise<CheckoutSelectors> {
        const { id: paymentId, nonce } = options.paymentMethod;

        if (nonce) {
            return super.initialize(options);
        }

        return this._placeOrderService.loadPaymentMethod(paymentId)
            .then(({ checkout }: CheckoutSelectors) => {
                const { clientToken } = checkout.getPaymentMethod(paymentId);

                this._braintreePaymentProcessor.initialize(clientToken, options);
                return this._braintreePaymentProcessor.preloadPaypal();
            })
            .then(() => super.initialize(options))
            .catch((error: Error) => this._handleError(error));
    }

    execute(orderRequest: OrderRequestBody, options?: any): Promise<CheckoutSelectors> {
        const { payment, useStoreCredit } = orderRequest;

        return Promise.all([
                this._preparePaymentData(payment),
                this._placeOrderService.submitOrder(omit(orderRequest, 'payment'), true, options),
            ])
            .then(([payment]) => this._placeOrderService.submitPayment(payment, useStoreCredit, options))
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

    private _preparePaymentData(payment: Payment): Promise<Payment> {
        const { checkout } = this._store.getState();
        const { amount } = checkout.getCart().grandTotal;
        const { currency, storeLanguage } = checkout.getConfig();
        const { method, nonce } = this._paymentMethod!;

        if (nonce) {
            return Promise.resolve({ ...payment, paymentData: { nonce, method } });
        }

        const tokenizedCard = this._braintreePaymentProcessor
            .paypal(amount, storeLanguage, currency.code, this._credit);

        return this._braintreePaymentProcessor.appendSessionId(tokenizedCard)
            .then((paymentData) => ({ ...payment, paymentData: { ...paymentData, method } }));
    }
}
