import {
    InvalidArgumentError,
    NotInitializedError,
    NotInitializedErrorType,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentRequestOptions,
    PaymentStrategy,
} from "@bigcommerce/checkout-sdk/payment-integration-api";

import { BrowserStorage } from "packages/core/src/common/storage";

import { getPPSDKMethod } from './get-ppsdk-payment-method';
import { PPSDKCompletedPayments } from './ppsdk-completed-payments';
import { PaymentResumer } from './ppsdk-payment-resumer';
import { SubStrategy } from './ppsdk-sub-strategy';
import { SubStrategyRegistry } from './ppsdk-sub-strategy-registry';

export class PPSDKStrategy implements PaymentStrategy {
    private _subStrategy?: SubStrategy;
    private _completedPayments: PPSDKCompletedPayments;

    constructor(
        private _paymentIntegrationService: PaymentIntegrationService,
        private _subStrategyRegistry: SubStrategyRegistry,
        private _paymentResumer: PaymentResumer,
        browserStorage: BrowserStorage
    ) {
        this._completedPayments = new PPSDKCompletedPayments(browserStorage);
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const state = this._paymentIntegrationService.getState();
        const config = state.getStoreConfigOrThrow();
        // const { bigpayBaseUrl } = this._store.getState().config.getStoreConfigOrThrow().paymentSettings;
        const { bigpayBaseUrl } = config.paymentSettings;

        if (!options?.methodId) {
            throw new InvalidArgumentError('Unable to submit payment because "options.methodId" argument is not provided.');
        }

        const { methodId } = options;
        const { payment, ...order } = payload;
        const { _subStrategy: subStrategy } = this;

        if (!subStrategy) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        // await this._store.dispatch(this._orderActionCreator.submitOrder(order, options));
        await this._paymentIntegrationService.submitOrder(order, options);

        // const token = this._store.getState().order.getOrderMeta()?.token;
        // if (!token) {
        //     throw new MissingDataError(MissingDataErrorType.MissingOrder);
        // }
        const token = state.getPaymentTokenOrThrow();

        await subStrategy.execute({ methodId, payment, bigpayBaseUrl, token });
    }

    async finalize(options?: PaymentRequestOptions): Promise<void> {
        const state = this._paymentIntegrationService.getState();
        const config = state.getStoreConfigOrThrow();
        // const order = this._store.getState().order.getOrderOrThrow();
        const order = state.getOrderOrThrow();

        if (order.isComplete) {
            return;
        }

        // const { bigpayBaseUrl } = this._store.getState().config.getStoreConfigOrThrow().paymentSettings;
        const { bigpayBaseUrl } = config.paymentSettings;

        if (!options?.methodId) {
            throw new InvalidArgumentError('Unable to submit payment because "options.methodId" argument is not provided.');
        }

        // const paymentId = this._store.getState().order.getOrderPaymentId(options?.methodId);
        const paymentId = state.getOrderPaymentId(options?.methodId);

        if (!paymentId || !order || this._completedPayments.isCompleted(paymentId)) {
            throw new OrderFinalizationNotRequiredError();
        }

        const { orderId } = order;

        await this._paymentResumer.resume({ paymentId, bigpayBaseUrl, orderId })
            .catch(error => {
                this._completedPayments.setCompleted(paymentId);
                throw error;
            });
    }

    async initialize(options?: PaymentInitializeOptions): Promise<void> {
        if (!options?.methodId) {
            throw new InvalidArgumentError('Unable to submit payment because "options.methodId" argument is not provided.');
        }

        const paymentMethod = getPPSDKMethod(this._paymentIntegrationService, options.methodId);

        if (!paymentMethod) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        this._subStrategy = this._subStrategyRegistry.getByMethod(paymentMethod);

        if (!this._subStrategy) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        await this._subStrategy.initialize(options);
    }

    async deinitialize(_options?: PaymentRequestOptions): Promise<void> {
        this._subStrategy?.deinitialize();
    }
}
