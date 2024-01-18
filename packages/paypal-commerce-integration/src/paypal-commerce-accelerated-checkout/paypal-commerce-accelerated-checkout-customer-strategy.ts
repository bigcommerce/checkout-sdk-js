import {
    CustomerCredentials,
    CustomerInitializeOptions,
    CustomerStrategy,
    ExecutePaymentMethodCheckoutOptions,
    InvalidArgumentError,
    PaymentIntegrationService,
    RequestOptions,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    PayPalCommerceAcceleratedCheckoutUtils,
    PayPalCommerceConnectAuthenticationResult,
    PayPalCommerceConnectAuthenticationState,
    PayPalCommerceConnectStylesOption,
    PayPalCommerceInitializationData,
    PayPalCommerceSdk,
} from '@bigcommerce/checkout-sdk/paypal-commerce-utils';

import { WithPayPalCommerceAcceleratedCheckoutCustomerInitializeOptions } from './paypal-commerce-accelerated-checkout-customer-initialize-options';

export default class PayPalCommerceAcceleratedCheckoutCustomerStrategy implements CustomerStrategy {
    private paypalConnectStyles?: PayPalCommerceConnectStylesOption;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private paypalCommerceSdk: PayPalCommerceSdk,
        private paypalCommerceAcceleratedCheckoutUtils: PayPalCommerceAcceleratedCheckoutUtils,
    ) {}

    async initialize(
        options: CustomerInitializeOptions &
            WithPayPalCommerceAcceleratedCheckoutCustomerInitializeOptions,
    ): Promise<void> {
        const { methodId, paypalcommerceacceleratedcheckout } = options;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to proceed because "methodId" argument is not provided.',
            );
        }

        await this.paymentIntegrationService.loadPaymentMethod(methodId);

        if (this.isAcceleratedCheckoutFeatureEnabled(methodId)) {
            const state = this.paymentIntegrationService.getState();
            const currency = state.getCartOrThrow().currency.code;
            const paymentMethod =
                state.getPaymentMethodOrThrow<PayPalCommerceInitializationData>(methodId);

            this.paypalConnectStyles = paypalcommerceacceleratedcheckout?.styles;

            const paypalAxoSdk = await this.paypalCommerceSdk.getPayPalAxo(paymentMethod, currency);
            const isTestModeEnabled = !!paymentMethod.initializationData?.isDeveloperModeApplicable;

            await this.paypalCommerceAcceleratedCheckoutUtils.initializePayPalConnect(
                paypalAxoSdk,
                isTestModeEnabled,
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
        const { checkoutPaymentMethodExecuted, continueWithCheckoutCallback, methodId } =
            options || {};

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to proceed because "methodId" argument is not provided.',
            );
        }

        if (typeof continueWithCheckoutCallback !== 'function') {
            throw new InvalidArgumentError(
                'Unable to proceed because "continueWithCheckoutCallback" argument is not provided and it must be a function.',
            );
        }

        if (this.isAcceleratedCheckoutFeatureEnabled(methodId)) {
            const shouldRunAuthenticationFlow = await this.shouldRunAuthenticationFlow(methodId);

            if (
                checkoutPaymentMethodExecuted &&
                typeof checkoutPaymentMethodExecuted === 'function'
            ) {
                checkoutPaymentMethodExecuted();
            }

            if (shouldRunAuthenticationFlow) {
                await this.runPayPalConnectAuthenticationFlowOrThrow(methodId);
            }
        }

        continueWithCheckoutCallback();
    }

    /**
     *
     * Authentication flow methods
     *
     */
    private isAcceleratedCheckoutFeatureEnabled(methodId: string): boolean {
        const state = this.paymentIntegrationService.getState();
        const paymentMethod =
            state.getPaymentMethodOrThrow<PayPalCommerceInitializationData>(methodId);

        return !!paymentMethod.initializationData?.isAcceleratedCheckoutEnabled;
    }

    // TODO: remove when A/B testing will be finished
    private async shouldRunAuthenticationFlow(methodId: string): Promise<boolean> {
        try {
            await this.paymentIntegrationService.loadPaymentMethod(methodId);

            const state = this.paymentIntegrationService.getState();
            const paymentMethod =
                state.getPaymentMethodOrThrow<PayPalCommerceInitializationData>(methodId);

            return paymentMethod.initializationData?.shouldRunAcceleratedCheckout || false;
        } catch (_) {
            return false;
        }
    }

    private async runPayPalConnectAuthenticationFlowOrThrow(methodId: string): Promise<void> {
        try {
            const state = this.paymentIntegrationService.getState();
            const cart = state.getCartOrThrow();
            const customer = state.getCustomer();
            const billingAddress = state.getBillingAddress();
            const customerEmail = customer?.email || billingAddress?.email || '';

            const { customerContextId } =
                await this.paypalCommerceAcceleratedCheckoutUtils.lookupCustomerOrThrow(
                    customerEmail,
                );

            const authenticationResult =
                await this.paypalCommerceAcceleratedCheckoutUtils.triggerAuthenticationFlowOrThrow(
                    customerContextId,
                    this.paypalConnectStyles,
                );

            const isAuthenticationFlowCanceled =
                authenticationResult.authenticationState ===
                PayPalCommerceConnectAuthenticationState.CANCELED;

            await this.updateCustomerDataState(methodId, authenticationResult);
            this.paypalCommerceAcceleratedCheckoutUtils.updateStorageSessionId(
                isAuthenticationFlowCanceled,
                cart.id,
            );
        } catch (error) {
            // Info: Do not throw anything here to avoid blocking customer from passing checkout flow
        }
    }

    private async updateCustomerDataState(
        methodId: string,
        authenticationResult: PayPalCommerceConnectAuthenticationResult,
    ): Promise<void> {
        const state = this.paymentIntegrationService.getState();
        const cart = state.getCartOrThrow();

        const { authenticationState, addresses, billingAddress, shippingAddress, instruments } =
            this.paypalCommerceAcceleratedCheckoutUtils.mapPayPalConnectProfileToBcCustomerData(
                methodId,
                authenticationResult,
            );

        await this.paymentIntegrationService.updatePaymentProviderCustomer({
            authenticationState,
            addresses,
            instruments,
        });

        if (billingAddress) {
            await this.paymentIntegrationService.updateBillingAddress(billingAddress);
        }

        // Info: if not a digital item
        if (shippingAddress && cart.lineItems.physicalItems.length > 0) {
            await this.paymentIntegrationService.updateShippingAddress(shippingAddress);
        }
    }
}
