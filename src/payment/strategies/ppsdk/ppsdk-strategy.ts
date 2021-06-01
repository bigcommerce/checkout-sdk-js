import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import { getPPSDKMethod } from './get-ppsdk-payment-method';
import { getPaymentProcessor , PaymentProcessor } from './ppsdk-payment-processor';

export class PPSDKStrategy implements PaymentStrategy {
    private _paymentProcessor?: PaymentProcessor;

    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator
    ) {}

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;
        const { _paymentProcessor: paymentProcessor } = this;

        if (!paymentProcessor) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._store.dispatch(this._orderActionCreator.submitOrder(order, options))
            .then(() => paymentProcessor(payment))
            .then(() => this._store.getState());
    }

    finalize(_options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }

    initialize(options?: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const paymentMethod = getPPSDKMethod(this._store, options);

        if (!paymentMethod) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        this._paymentProcessor = getPaymentProcessor(paymentMethod);

        if (!this._paymentProcessor) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return Promise.resolve(this._store.getState());
    }

    deinitialize(_options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }
}
