import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import { getPPSDKMethod } from './get-ppsdk-payment-method';
import { PaymentProcessor } from './ppsdk-payment-processor';
import { PaymentProcessorRegistry } from './ppsdk-payment-processor-registry';
import { PaymentResumer } from './ppsdk-payment-resumer';

export class PPSDKStrategy implements PaymentStrategy {
    private _paymentProcessor?: PaymentProcessor;

    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentProcessorRegistry: PaymentProcessorRegistry,
        private _paymentResumer: PaymentResumer
    ) {}

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { bigpayBaseUrl } = this._store.getState().config.getStoreConfigOrThrow().paymentSettings;

        if (!options?.methodId) {
            throw new InvalidArgumentError('Unable to submit payment because "options.methodId" argument is not provided.');
        }

        const { methodId } = options;
        const { payment, ...order } = payload;
        const { _paymentProcessor: paymentProcessor } = this;

        if (!paymentProcessor) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        await this._store.dispatch(this._orderActionCreator.submitOrder(order, options));

        const token = this._store.getState().order.getOrderMeta()?.token;

        if (!token) {
            throw new MissingDataError(MissingDataErrorType.MissingOrder);
        }

        await paymentProcessor.process({ methodId, payment, bigpayBaseUrl, token });

        return this._store.getState();
    }

    async finalize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const order = this._store.getState().order.getOrderOrThrow();

        if (order.isComplete) {
            return this._store.getState();
        }

        const { bigpayBaseUrl } = this._store.getState().config.getStoreConfigOrThrow().paymentSettings;

        if (!options?.methodId) {
            throw new InvalidArgumentError('Unable to submit payment because "options.methodId" argument is not provided.');
        }

        const paymentId = this._store.getState().order.getPaymentId(options?.methodId);
        const token = this._store.getState().order.getOrderMeta()?.token;

        if (!paymentId || !token) {
            throw new OrderFinalizationNotRequiredError();
        }

        await this._paymentResumer.resume({ paymentId, bigpayBaseUrl, token });

        return this._store.getState();
    }

    async initialize(options?: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        if (!options?.methodId) {
            throw new InvalidArgumentError('Unable to submit payment because "options.methodId" argument is not provided.');
        }

        const paymentMethod = getPPSDKMethod(this._store, options.methodId);

        if (!paymentMethod) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        this._paymentProcessor = this._paymentProcessorRegistry.getByMethod(paymentMethod);

        if (!this._paymentProcessor) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._store.getState();
    }

    async deinitialize(_options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        return this._store.getState();
    }
}
