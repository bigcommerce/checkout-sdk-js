import {
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
    OrderFinalizationNotRequiredError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    isStripePaymentMethodLike,
    StripeClient,
    StripeElements,
    StripeInitializationData,
    StripeIntegrationService,
    StripeJsVersion,
    StripeScriptLoader,
} from '@bigcommerce/checkout-sdk/stripe-utils';

import StripeCSPaymentInitializeOptions, {
    WithStripeCSPaymentInitializeOptions,
} from './stripe-cs-initialize-options';

export default class StripeOCSPaymentStrategy implements PaymentStrategy {
    private stripeClient?: StripeClient;
    private stripeElements?: StripeElements;

    constructor(
        private readonly paymentIntegrationService: PaymentIntegrationService,
        private readonly scriptLoader: StripeScriptLoader,
        private readonly stripeIntegrationService: StripeIntegrationService,
    ) {}

    async initialize(
        options: PaymentInitializeOptions & WithStripeCSPaymentInitializeOptions,
    ): Promise<void> {
        const { stripeocs, methodId, gatewayId } = options;

        if (!stripeocs?.containerId || !gatewayId) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        try {
            await this._initializeStripeElement(stripeocs, gatewayId, methodId);
        } catch (error) {
            if (error instanceof Error) {
                stripeocs.onError?.(error);
            }
        }

        this.stripeIntegrationService.initCheckoutEventsSubscription(
            gatewayId,
            methodId,
            stripeocs,
            this.stripeElements,
        );
    }

    async execute(): Promise<void> {
        return Promise.resolve();
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private async _initializeStripeElement(
        _stripe: StripeCSPaymentInitializeOptions,
        gatewayId: string,
        methodId: string,
    ) {
        let paymentMethod = this.paymentIntegrationService
            .getState()
            .getPaymentMethodOrThrow<StripeInitializationData>(methodId, gatewayId);

        if (!paymentMethod?.clientToken) {
            const state = await this.paymentIntegrationService.loadPaymentMethod(gatewayId, {
                params: { method: methodId },
            });

            paymentMethod = state.getPaymentMethodOrThrow<StripeInitializationData>(
                methodId,
                gatewayId,
            );
        }

        if (!isStripePaymentMethodLike(paymentMethod)) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const { clientToken, initializationData } = paymentMethod;

        if (!clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this.stripeClient = await this._loadStripeJs(initializationData);
    }

    private async _loadStripeJs(
        initializationData: StripeInitializationData,
    ): Promise<StripeClient> {
        if (this.stripeClient) {
            return this.stripeClient;
        }

        const state = this.paymentIntegrationService.getState();

        return this.scriptLoader.getStripeClient(
            initializationData,
            state.getCartLocale(),
            StripeJsVersion.CLOVER,
        );
    }
}
