import { BraintreeInitializationData } from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    CustomerCredentials,
    CustomerInitializeOptions,
    CustomerStrategy,
    ExecutePaymentMethodCheckoutOptions,
    InvalidArgumentError,
    PaymentIntegrationService,
    PaymentMethod,
    RequestOptions,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { WithBraintreeFastlaneCustomerInitializeOptions } from './braintree-fastlane-customer-initialize-options';
import BraintreeFastlaneUtils from './braintree-fastlane-utils';

export default class BraintreeFastlaneCustomerStrategy implements CustomerStrategy {
    private isAcceleratedCheckoutEnabled = false;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private braintreeFastlaneUtils: BraintreeFastlaneUtils,
    ) {}

    async initialize({
        methodId,
        braintreeafastlane,
    }: CustomerInitializeOptions & WithBraintreeFastlaneCustomerInitializeOptions): Promise<void> {
        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to proceed because "methodId" argument is not provided.',
            );
        }

        const paymentMethod = await this.getValidPaymentMethodOrThrow(methodId);

        this.isAcceleratedCheckoutEnabled =
            !!paymentMethod.initializationData?.isAcceleratedCheckoutEnabled;

        try {
            if (this.isAcceleratedCheckoutEnabled) {
                await this.braintreeFastlaneUtils.initializeBraintreeFastlaneOrThrow(
                    paymentMethod.id,
                    braintreeafastlane?.styles,
                );
            }
        } catch (_) {
            // Info: Do not throw anything here to avoid blocking customer from passing checkout flow
        }

        return Promise.resolve();
    }

    async deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    async signIn(credentials: CustomerCredentials, options?: RequestOptions): Promise<void> {
        await this.paymentIntegrationService.signInCustomer(credentials, options);
    }

    async signOut(options?: RequestOptions): Promise<void> {
        await this.paymentIntegrationService.signOutCustomer(options);
    }

    async executePaymentMethodCheckout(
        options?: ExecutePaymentMethodCheckoutOptions,
    ): Promise<void> {
        const { checkoutPaymentMethodExecuted, continueWithCheckoutCallback } = options || {};

        if (typeof continueWithCheckoutCallback !== 'function') {
            throw new InvalidArgumentError(
                'Unable to proceed because "continueWithCheckoutCallback" argument is not provided and it must be a function.',
            );
        }

        const state = this.paymentIntegrationService.getState();
        const customer = state.getCustomerOrThrow();

        if (this.isAcceleratedCheckoutEnabled && customer.isGuest) {
            const shouldRunAuthenticationFlow = await this.shouldRunAuthenticationFlow();

            if (
                checkoutPaymentMethodExecuted &&
                typeof checkoutPaymentMethodExecuted === 'function'
            ) {
                checkoutPaymentMethodExecuted();
            }

            if (shouldRunAuthenticationFlow) {
                await this.braintreeFastlaneUtils.runPayPalAuthenticationFlowOrThrow(
                    undefined,
                    true,
                );
            }
        }

        continueWithCheckoutCallback();
    }

    // TODO: remove this method after A/B testing finished
    private async shouldRunAuthenticationFlow(): Promise<boolean> {
        const primaryMethodId = 'braintreeacceleratedcheckout';

        try {
            // Info: we should load payment method each time to detect if the user
            // should be in a test or in a control group
            await this.paymentIntegrationService.loadPaymentMethod(primaryMethodId);

            const state = this.paymentIntegrationService.getState();
            const paymentMethod =
                state.getPaymentMethodOrThrow<BraintreeInitializationData>(primaryMethodId);

            // Info: shouldRunAcceleratedCheckout is responsible for the flow of A/B testing purposes
            // when shouldRunAcceleratedCheckout is true, the lookup PayPal Connect method should be called,
            // otherwise AcceleratedCheckout should not be available for the customer
            return paymentMethod.initializationData?.shouldRunAcceleratedCheckout || false;
        } catch (_) {
            return false;
        }
    }

    private async getValidPaymentMethodOrThrow(
        methodId: string,
    ): Promise<PaymentMethod<BraintreeInitializationData>> {
        let validPaymentMethodId = methodId;

        try {
            await this.paymentIntegrationService.loadPaymentMethod(validPaymentMethodId);
        } catch {
            validPaymentMethodId =
                methodId === 'braintree' ? 'braintreeacceleratedcheckout' : 'braintree';
            await this.paymentIntegrationService.loadPaymentMethod(validPaymentMethodId);
        }

        return this.paymentIntegrationService
            .getState()
            .getPaymentMethodOrThrow<BraintreeInitializationData>(validPaymentMethodId);
    }
}
