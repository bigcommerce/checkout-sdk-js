import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import { getPPSDKMethod } from './get-ppsdk-payment-method';
import { PaymentProcessor } from './ppsdk-payment-processor';
import { PaymentProcessorRegistry } from './ppsdk-payment-processor-registry';

export class PPSDKStrategy implements PaymentStrategy {
    private _paymentProcessor?: PaymentProcessor;

    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentProcessorRegistry: PaymentProcessorRegistry
    ) {}

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        if (!options?.methodId) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const paymentMethod = getPPSDKMethod(this._store, options.methodId);

        const { payment, ...order } = payload;
        const { _paymentProcessor: paymentProcessor } = this;

        if (!paymentProcessor || !paymentMethod) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._store.dispatch(this._orderActionCreator.submitOrder(order, options))
            .then(() => paymentProcessor.process(paymentMethod, payment))
            .then(() => this._store.getState());
    }

    finalize(_options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }

    initialize(options?: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        if (!options?.methodId) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const paymentMethod = getPPSDKMethod(this._store, options.methodId);

        if (!paymentMethod) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        this._paymentProcessor = this._paymentProcessorRegistry.getByMethod(paymentMethod);

        if (!this._paymentProcessor) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return Promise.resolve(this._store.getState());
    }

    deinitialize(_options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }
}
