import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
} from '../../../common/error/errors';
import { BrowserStorage } from '../../../common/storage';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import { getPPSDKMethod } from './get-ppsdk-payment-method';
import { PPSDKCompletedPayments } from './ppsdk-completed-payments';
import { PaymentResumer } from './ppsdk-payment-resumer';
import { SubStrategy } from './ppsdk-sub-strategy';
import { SubStrategyRegistry } from './ppsdk-sub-strategy-registry';

export class PPSDKStrategy implements PaymentStrategy {
    private _subStrategy?: SubStrategy;
    private _completedPayments: PPSDKCompletedPayments;

    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _subStrategyRegistry: SubStrategyRegistry,
        private _paymentResumer: PaymentResumer,
        browserStorage: BrowserStorage,
    ) {
        this._completedPayments = new PPSDKCompletedPayments(browserStorage);
    }

    async execute(
        payload: OrderRequestBody,
        options?: PaymentRequestOptions,
    ): Promise<InternalCheckoutSelectors> {
        const { bigpayBaseUrl } = this._store
            .getState()
            .config.getStoreConfigOrThrow().paymentSettings;

        if (!options?.methodId) {
            throw new InvalidArgumentError(
                'Unable to submit payment because "options.methodId" argument is not provided.',
            );
        }

        const { methodId } = options;
        const { payment, ...order } = payload;
        const { _subStrategy: subStrategy } = this;

        if (!subStrategy) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        await this._store.dispatch(this._orderActionCreator.submitOrder(order, options));

        const token = this._store.getState().order.getOrderMeta()?.token;

        if (!token) {
            throw new MissingDataError(MissingDataErrorType.MissingOrder);
        }

        await subStrategy.execute({ methodId, payment, bigpayBaseUrl, token });

        return this._store.getState();
    }

    async finalize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const order = this._store.getState().order.getOrderOrThrow();

        if (order.isComplete) {
            return this._store.getState();
        }

        const { bigpayBaseUrl } = this._store
            .getState()
            .config.getStoreConfigOrThrow().paymentSettings;

        if (!options?.methodId) {
            throw new InvalidArgumentError(
                'Unable to submit payment because "options.methodId" argument is not provided.',
            );
        }

        const paymentId = this._store.getState().order.getPaymentId(options.methodId);

        if (!paymentId || !order || this._completedPayments.isCompleted(paymentId)) {
            throw new OrderFinalizationNotRequiredError();
        }

        const { orderId } = order;

        await this._paymentResumer.resume({ paymentId, bigpayBaseUrl, orderId }).catch((error) => {
            this._completedPayments.setCompleted(paymentId);
            throw error;
        });

        return this._store.getState();
    }

    async initialize(options?: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        if (!options?.methodId) {
            throw new InvalidArgumentError(
                'Unable to submit payment because "options.methodId" argument is not provided.',
            );
        }

        const paymentMethod = getPPSDKMethod(this._store, options.methodId);

        if (!paymentMethod) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        this._subStrategy = this._subStrategyRegistry.getByMethod(paymentMethod);

        if (!this._subStrategy) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        await this._subStrategy.initialize(options);

        return this._store.getState();
    }

    async deinitialize(_options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        this._subStrategy?.deinitialize();

        return this._store.getState();
    }
}
