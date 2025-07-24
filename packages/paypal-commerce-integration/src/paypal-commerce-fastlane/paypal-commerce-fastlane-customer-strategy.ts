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
    getFastlaneStyles,
    PayPalCommerceFastlaneUtils,
    PayPalCommerceInitializationData,
    PayPalCommerceSdk,
    PayPalFastlaneAuthenticationResult,
    PayPalFastlaneAuthenticationState,
    PayPalFastlaneStylesOption,
} from '@bigcommerce/checkout-sdk/paypal-commerce-utils';

import PayPalCommerceFastlaneCustomerInitializeOptions, {
    WithPayPalCommerceFastlaneCustomerInitializeOptions,
} from './paypal-commerce-fastlane-customer-initialize-options';

export default class PayPalCommerceFastlaneCustomerStrategy implements CustomerStrategy {
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

        try {
            await this.paymentIntegrationService.loadPaymentMethod(methodId);

            const state = this.paymentIntegrationService.getState();
            const cart = state.getCartOrThrow();
            const paymentMethod =
                state.getPaymentMethodOrThrow<PayPalCommerceInitializationData>(methodId);

            const isTestModeEnabled = !!paymentMethod.initializationData?.isDeveloperModeApplicable;

            const paypalFastlaneSdk = await this.paypalCommerceSdk.getPayPalFastlaneSdk(
                paymentMethod,
                cart.currency.code,
                cart.id,
            );

            await this.paypalCommerceFastlaneUtils.initializePayPalFastlane(
                paypalFastlaneSdk,
                isTestModeEnabled,
                this.getFastlaneStyles(methodId, paypalcommercefastlane),
            );
        } catch (_) {
            // TODO: add logger to be able to debug issues if there any
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

        if (customer.isGuest) {
            if (
                checkoutPaymentMethodExecuted &&
                typeof checkoutPaymentMethodExecuted === 'function'
            ) {
                checkoutPaymentMethodExecuted();
            }

            try {
                await this.runPayPalAuthenticationFlowOrThrow(methodId);
            } catch (_) {
                // TODO: add logger to be able to debug issues if there any
                // Info: Do not throw anything here to avoid blocking customer from passing checkout flow
            }
        }

        continueWithCheckoutCallback();
    }

    /**
     *
     * Authentication flow methods
     *
     */
    private async runPayPalAuthenticationFlowOrThrow(methodId: string): Promise<void> {
        const state = this.paymentIntegrationService.getState();
        const cartId = state.getCartOrThrow().id;
        const customer = state.getCustomer();
        const billingAddress = state.getBillingAddress();
        const customerEmail = customer?.email || billingAddress?.email || '';

        const { customerContextId } = await this.paypalCommerceFastlaneUtils.lookupCustomerOrThrow(
            customerEmail,
        );

        const authenticationResult =
            await this.paypalCommerceFastlaneUtils.triggerAuthenticationFlowOrThrow(
                customerContextId,
            );

        const isAuthenticationFlowCanceled =
            authenticationResult.authenticationState === PayPalFastlaneAuthenticationState.CANCELED;

        await this.updateCustomerDataState(methodId, authenticationResult);

        if (isAuthenticationFlowCanceled) {
            this.paypalCommerceFastlaneUtils.removeStorageSessionId();
        } else {
            this.paypalCommerceFastlaneUtils.updateStorageSessionId(cartId);
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
            const updatedState = await this.paymentIntegrationService.updateShippingAddress(
                shippingAddress,
            );

            const paymentMethod =
                updatedState.getPaymentMethodOrThrow<PayPalCommerceInitializationData>(methodId);
            const { isFastlaneShippingOptionAutoSelectEnabled } =
                paymentMethod.initializationData || {};
            const consignments = updatedState.getConsignments() || [];
            const availableShippingOptions = consignments[0]?.availableShippingOptions || [];
            const firstShippingOption = availableShippingOptions[0];
            const recommendedShippingOption = availableShippingOptions.find(
                (option) => option.isRecommended,
            );

            if (
                (recommendedShippingOption || firstShippingOption) &&
                isFastlaneShippingOptionAutoSelectEnabled
            ) {
                const shippingOptionId = recommendedShippingOption?.id || firstShippingOption.id;

                await this.paymentIntegrationService.selectShippingOption(shippingOptionId);
            }
        }
    }

    /**
     *
     * Fastlane styling methods
     *
     */
    private getFastlaneStyles(
        methodId: string,
        paypalcommercefastlane: PayPalCommerceFastlaneCustomerInitializeOptions | undefined,
    ): PayPalFastlaneStylesOption | undefined {
        const state = this.paymentIntegrationService.getState();
        const paymentMethod =
            state.getPaymentMethodOrThrow<PayPalCommerceInitializationData>(methodId);

        const { fastlaneStyles, isFastlaneStylingEnabled } = paymentMethod.initializationData || {};

        return getFastlaneStyles(
            isFastlaneStylingEnabled ? fastlaneStyles : {},
            paypalcommercefastlane?.styles,
        );
    }
}
