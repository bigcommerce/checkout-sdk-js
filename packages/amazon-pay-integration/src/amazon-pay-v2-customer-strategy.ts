import {
    AmazonPayV2InitializeOptions,
    AmazonPayV2PaymentProcessor,
    AmazonPayV2Placement,
} from '@bigcommerce/checkout-sdk/amazon-pay-utils';
import {
    CustomerInitializeOptions,
    CustomerStrategy,
    ExecutePaymentMethodCheckoutOptions,
    InvalidArgumentError,
    NotImplementedError,
    PaymentIntegrationService,
    PaymentMethod,
    RequestOptions,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { WithAmazonPayV2CustomerInitializeOptions } from './amazon-pay-v2-customer-initialize-options';

export default class AmazonPayV2CustomerStrategy implements CustomerStrategy {
    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private amazonPayV2PaymentProcessor: AmazonPayV2PaymentProcessor,
    ) {}

    async initialize(
        options: CustomerInitializeOptions & WithAmazonPayV2CustomerInitializeOptions,
    ): Promise<void> {
        const { methodId, amazonpay } = options;

        if (!methodId || !amazonpay?.container) {
            throw new InvalidArgumentError(
                'Unable to proceed because "methodId" or "containerId" argument is not provided.',
            );
        }

        let paymentMethod: PaymentMethod<AmazonPayV2InitializeOptions>;

        try {
            paymentMethod = this.paymentIntegrationService
                .getState()
                .getPaymentMethodOrThrow(methodId);
        } catch (_e) {
            await this.paymentIntegrationService.loadPaymentMethod(methodId);
            paymentMethod = this.paymentIntegrationService
                .getState()
                .getPaymentMethodOrThrow(methodId);
        }

        await this.amazonPayV2PaymentProcessor.initialize(paymentMethod);

        this.amazonPayV2PaymentProcessor.renderAmazonPayButton({
            checkoutState: this.paymentIntegrationService.getState(),
            containerId: amazonpay.container,
            methodId,
            placement: AmazonPayV2Placement.Checkout,
        });
    }

    async deinitialize(): Promise<void> {
        await this.amazonPayV2PaymentProcessor.deinitialize();
    }

    signIn(): Promise<void> {
        throw new NotImplementedError(
            'In order to sign in via Amazon, the shopper must click on "Amazon Pay" button.',
        );
    }

    async signOut(options?: RequestOptions): Promise<void> {
        const state = this.paymentIntegrationService.getState();
        const payment = state.getPaymentId();

        if (!payment) {
            return;
        }

        await this.amazonPayV2PaymentProcessor.signout();
        await this.paymentIntegrationService.remoteCheckoutSignOut(payment.providerId, options);
    }

    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<void> {
        options?.continueWithCheckoutCallback?.();

        return Promise.resolve();
    }
}
