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
import {
    PayPalCommerceAcceleratedCheckoutUtils,
    PayPalCommerceConnectAuthenticationResult,
    PayPalCommerceConnectAuthenticationState,
    PayPalCommerceInitializationData,
    PayPalCommerceSdk,
} from '@bigcommerce/checkout-sdk/paypal-commerce-utils';

import { WithPayPalCommerceAcceleratedCheckoutCustomerInitializeOptions } from './paypal-commerce-accelerated-checkout-customer-initialize-options';

export default class PayPalCommerceAcceleratedCheckoutCustomerStrategy implements CustomerStrategy {
    private isAcceleratedCheckoutFeatureEnabled = false;
    private primaryMethodId = 'paypalcommerceacceleratedcheckout';
    private secondaryMethodId = 'paypalcommercecreditcards';

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

        const paymentMethod = await this.getValidPaymentMethodOrThrow(methodId);

        this.isAcceleratedCheckoutFeatureEnabled =
            !!paymentMethod.initializationData?.isAcceleratedCheckoutEnabled;

        if (this.isAcceleratedCheckoutFeatureEnabled) {
            const state = this.paymentIntegrationService.getState();
            const currency = state.getCartOrThrow().currency.code;

            const paypalAxoSdk = await this.paypalCommerceSdk.getPayPalAxo(paymentMethod, currency);
            const isTestModeEnabled = !!paymentMethod.initializationData?.isDeveloperModeApplicable;

            await this.paypalCommerceAcceleratedCheckoutUtils.initializePayPalConnect(
                paypalAxoSdk,
                isTestModeEnabled,
                paypalcommerceacceleratedcheckout?.styles,
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

        if (this.isAcceleratedCheckoutFeatureEnabled) {
            const shouldRunAuthenticationFlow = await this.shouldRunAuthenticationFlow();

            if (
                checkoutPaymentMethodExecuted &&
                typeof checkoutPaymentMethodExecuted === 'function'
            ) {
                checkoutPaymentMethodExecuted();
            }

            if (shouldRunAuthenticationFlow) {
                await this.runPayPalConnectAuthenticationFlowOrThrow();
            }
        }

        continueWithCheckoutCallback();
    }

    /**
     *
     * Authentication flow methods
     *
     */
    // TODO: remove when A/B testing will be finished
    private async shouldRunAuthenticationFlow(): Promise<boolean> {
        try {
            await this.paymentIntegrationService.loadPaymentMethod(this.primaryMethodId);

            const state = this.paymentIntegrationService.getState();
            const paymentMethod = state.getPaymentMethodOrThrow<PayPalCommerceInitializationData>(
                this.primaryMethodId,
            );

            return paymentMethod.initializationData?.shouldRunAcceleratedCheckout || false;
        } catch (_) {
            return false;
        }
    }

    private async runPayPalConnectAuthenticationFlowOrThrow(): Promise<void> {
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
                );

            const isAuthenticationFlowCanceled =
                authenticationResult.authenticationState ===
                PayPalCommerceConnectAuthenticationState.CANCELED;

            await this.updateCustomerDataState(this.primaryMethodId, authenticationResult);
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

    /**
     *
     * Other
     *
     */
    private async getValidPaymentMethodOrThrow(
        methodId: string,
    ): Promise<PaymentMethod<PayPalCommerceInitializationData>> {
        let validPaymentMethodId = methodId;

        try {
            await this.paymentIntegrationService.loadPaymentMethod(validPaymentMethodId);
        } catch {
            validPaymentMethodId =
                methodId === this.secondaryMethodId ? this.primaryMethodId : this.secondaryMethodId;
            await this.paymentIntegrationService.loadPaymentMethod(validPaymentMethodId);
        }

        return this.paymentIntegrationService
            .getState()
            .getPaymentMethodOrThrow<PayPalCommerceInitializationData>(validPaymentMethodId);
    }
}
