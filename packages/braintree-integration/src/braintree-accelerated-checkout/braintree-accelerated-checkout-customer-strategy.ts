import { BraintreeInitializationData } from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    CustomerCredentials,
    CustomerInitializeOptions,
    CustomerStrategy,
    ExecutePaymentMethodCheckoutOptions,
    InvalidArgumentError,
    PaymentIntegrationService,
    RequestOptions,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { WithBraintreeAcceleratedCheckoutCustomerInitializeOptions } from './braintree-accelerated-checkout-customer-initialize-options';
import BraintreeAcceleratedCheckoutUtils from './braintree-accelerated-checkout-utils';

export default class BraintreeAcceleratedCheckoutCustomerStrategy implements CustomerStrategy {
    private isAcceleratedCheckoutEnabled = false;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private braintreeAcceleratedCheckoutUtils: BraintreeAcceleratedCheckoutUtils,
    ) {}

    async initialize({
        methodId,
        braintreeacceleratedcheckout,
    }: CustomerInitializeOptions &
        WithBraintreeAcceleratedCheckoutCustomerInitializeOptions): Promise<void> {
        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to proceed because "methodId" argument is not provided.',
            );
        }

        await this.paymentIntegrationService.loadPaymentMethod(methodId);

        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow<BraintreeInitializationData>(methodId);

        this.isAcceleratedCheckoutEnabled =
            !!paymentMethod.initializationData?.isAcceleratedCheckoutEnabled;

        if (this.isAcceleratedCheckoutEnabled) {
            await this.braintreeAcceleratedCheckoutUtils.initializeBraintreeConnectOrThrow(
                methodId,
                braintreeacceleratedcheckout?.styles,
            );
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
        const { continueWithCheckoutCallback, methodId } = options || {};

        if (typeof continueWithCheckoutCallback !== 'function') {
            throw new InvalidArgumentError(
                'Unable to proceed because "continueWithCheckoutCallback" argument is not provided and it must be a function.',
            );
        }

        if (await this.shouldRunAuthenticationFlow(methodId)) {
            await this.braintreeAcceleratedCheckoutUtils.runPayPalConnectAuthenticationFlowOrThrow();
        }

        continueWithCheckoutCallback();
    }

    private async shouldRunAuthenticationFlow(methodId?: string): Promise<boolean> {
        const primaryMethodId = 'braintreeacceleratedcheckout';

        if (!this.isAcceleratedCheckoutEnabled) {
            return false;
        }

        try {
            if (methodId !== primaryMethodId) {
                await this.paymentIntegrationService.loadPaymentMethod(primaryMethodId);
            }

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
}
