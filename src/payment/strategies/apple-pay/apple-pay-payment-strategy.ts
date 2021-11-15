import { PaymentStrategy } from "..";
import { CheckoutStore, InternalCheckoutSelectors } from "../../../checkout";
import { OrderFinalizationNotRequiredError } from "../../../order/errors";

export default class ApplePayPaymentStrategy implements PaymentStrategy {
    constructor(
        private _store: CheckoutStore,
    ) { }

    initialize(): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }

    async execute(payload: any): Promise<InternalCheckoutSelectors> {
        console.log(payload);

        return Promise.resolve(this._store.getState());
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }
}
