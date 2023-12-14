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

        const paymentMethod = await this.getValidPaymentMethodOrThrow(methodId);

        this.isAcceleratedCheckoutEnabled =
            !!paymentMethod.initializationData?.isAcceleratedCheckoutEnabled;

        if (this.isAcceleratedCheckoutEnabled) {
            await this.braintreeAcceleratedCheckoutUtils.initializeBraintreeConnectOrThrow(
                paymentMethod.id,
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
        const { checkoutPaymentMethodExecuted, continueWithCheckoutCallback } = options || {};

        if (typeof continueWithCheckoutCallback !== 'function') {
            throw new InvalidArgumentError(
                'Unable to proceed because "continueWithCheckoutCallback" argument is not provided and it must be a function.',
            );
        }

        if (await this.shouldRunAuthenticationFlow()) {
            await this.braintreeAcceleratedCheckoutUtils.runPayPalConnectAuthenticationFlowOrThrow();
        }

        if (checkoutPaymentMethodExecuted && typeof checkoutPaymentMethodExecuted === 'function') {
            checkoutPaymentMethodExecuted();
        }

        continueWithCheckoutCallback();
    }

    // TODO: remove this method after A/B testing finished
    private async shouldRunAuthenticationFlow(): Promise<boolean> {
        const primaryMethodId = 'braintreeacceleratedcheckout';

        if (!this.isAcceleratedCheckoutEnabled) {
            return false;
        }

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
