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
    getFastlaneStyles,
    PayPalCommerceFastlaneUtils,
    PayPalCommerceInitializationData,
    PayPalCommerceSdk,
    PayPalFastlaneAuthenticationResult,
    PayPalFastlaneAuthenticationState,
} from '@bigcommerce/checkout-sdk/paypal-commerce-utils';

import { WithPayPalCommerceFastlaneCustomerInitializeOptions } from './paypal-commerce-fastlane-customer-initialize-options';

export default class PayPalCommerceFastlaneCustomerStrategy implements CustomerStrategy {
    private isAcceleratedCheckoutFeatureEnabled = false;
    private primaryMethodId = 'paypalcommerceacceleratedcheckout';
    private secondaryMethodId = 'paypalcommercecreditcards';

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private paypalCommerceSdk: PayPalCommerceSdk,
        private paypalCommerceFastlaneUtils: PayPalCommerceFastlaneUtils,
    ) {}

    async initialize(
        options: CustomerInitializeOptions & WithPayPalCommerceFastlaneCustomerInitializeOptions,
    ): Promise<void> {
        const { methodId, paypalcommercefastlane } = options;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to proceed because "methodId" argument is not provided.',
            );
        }

        const paymentMethod = await this.getValidPaymentMethodOrThrow(methodId);
        const {
            isAcceleratedCheckoutEnabled,
            isFastlaneStylingEnabled,
            isDeveloperModeApplicable,
        } = paymentMethod.initializationData || {};

        this.isAcceleratedCheckoutFeatureEnabled = !!isAcceleratedCheckoutEnabled;

        try {
            if (this.isAcceleratedCheckoutFeatureEnabled) {
                const state = this.paymentIntegrationService.getState();
                const cart = state.getCartOrThrow();
                const currency = state.getCartOrThrow().currency.code;
                const isTestModeEnabled = !!isDeveloperModeApplicable;

                const paypalFastlaneSdk = await this.paypalCommerceSdk.getPayPalFastlaneSdk(
                    paymentMethod,
                    currency,
                    cart.id,
                );

                const paypalFastlaneStyles = isFastlaneStylingEnabled
                    ? paymentMethod?.initializationData?.fastlaneStyles
                    : {};

                const fastlaneStyles = getFastlaneStyles(
                    paypalFastlaneStyles,
                    paypalcommercefastlane?.styles,
                );

                await this.paypalCommerceFastlaneUtils.initializePayPalFastlane(
                    paypalFastlaneSdk,
                    isTestModeEnabled,
                    fastlaneStyles,
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

        const state = this.paymentIntegrationService.getState();
        const customer = state.getCustomerOrThrow();

        if (this.isAcceleratedCheckoutFeatureEnabled && customer.isGuest) {
            const shouldRunAuthenticationFlow = await this.shouldRunAuthenticationFlow();

            if (
                checkoutPaymentMethodExecuted &&
                typeof checkoutPaymentMethodExecuted === 'function'
            ) {
                checkoutPaymentMethodExecuted();
            }

            if (shouldRunAuthenticationFlow) {
                await this.runPayPalAuthenticationFlowOrThrow();
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

    private async runPayPalAuthenticationFlowOrThrow(): Promise<void> {
        try {
            const state = this.paymentIntegrationService.getState();
            const cartId = state.getCartOrThrow().id;
            const customer = state.getCustomer();
            const billingAddress = state.getBillingAddress();
            const customerEmail = customer?.email || billingAddress?.email || '';

            const { customerContextId } =
                await this.paypalCommerceFastlaneUtils.lookupCustomerOrThrow(customerEmail);

            const authenticationResult =
                await this.paypalCommerceFastlaneUtils.triggerAuthenticationFlowOrThrow(
                    customerContextId,
                );

            const isAuthenticationFlowCanceled =
                authenticationResult.authenticationState ===
                PayPalFastlaneAuthenticationState.CANCELED;

            await this.updateCustomerDataState(this.primaryMethodId, authenticationResult);
            this.paypalCommerceFastlaneUtils.updateStorageSessionId(
                isAuthenticationFlowCanceled,
                cartId,
            );
        } catch (_) {
            // Info: Do not throw anything here to avoid blocking customer from passing checkout flow
        }
    }

    private async updateCustomerDataState(
        methodId: string,
        authenticationResult: PayPalFastlaneAuthenticationResult,
    ): Promise<void> {
        const state = this.paymentIntegrationService.getState();
        const cart = state.getCartOrThrow();

        const { authenticationState, addresses, billingAddress, shippingAddress, instruments } =
            this.paypalCommerceFastlaneUtils.mapPayPalFastlaneProfileToBcCustomerData(
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

        if (shippingAddress && cart.lineItems.physicalItems.length > 0) {
            const consignments = state.getConsignments() || [];
            const availableShippingOptions = consignments[0]?.availableShippingOptions || [];
            const firstShippingOption = availableShippingOptions[0];
            const recommendedShippingOption = availableShippingOptions.find(
                (option) => option.isRecommended,
            );

            await this.paymentIntegrationService.updateShippingAddress(shippingAddress);

            if (recommendedShippingOption || firstShippingOption) {
                const shippingOptionId = recommendedShippingOption?.id || firstShippingOption.id;

                await this.paymentIntegrationService.selectShippingOption(shippingOptionId);
            }
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
