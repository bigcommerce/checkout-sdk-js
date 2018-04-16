import { CheckoutSelectors, CheckoutStore } from '../checkout';
import { Payment, PaymentActionCreator } from '../payment';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class PlaceOrderService {
    constructor(
        private _store: CheckoutStore,
        private _paymentActionCreator: PaymentActionCreator
    ) {}

    submitPayment(payment: Payment): Promise<CheckoutSelectors> {
        return this._store.dispatch(this._paymentActionCreator.submitPayment(payment));
    }
}
