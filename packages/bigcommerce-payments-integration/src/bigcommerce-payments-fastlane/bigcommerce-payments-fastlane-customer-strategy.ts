import {
    BigCommercePaymentsFastlaneUtils,
    BigCommercePaymentsInitializationData,
    getFastlaneStyles,
    PayPalFastlaneAuthenticationResult,
    PayPalFastlaneAuthenticationState,
    PayPalFastlaneStylesOption,
    PayPalSdkHelper,
} from '@bigcommerce/checkout-sdk/bigcommerce-payments-utils';
import {
    CustomerCredentials,
    CustomerInitializeOptions,
    CustomerStrategy,
    ExecutePaymentMethodCheckoutOptions,
    InvalidArgumentError,
    PaymentIntegrationService,
    RequestOptions,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BigCommercePaymentsFastlaneCustomerInitializeOptions, {
    WithBigCommercePaymentsFastlaneCustomerInitializeOptions,
} from './bigcommerce-payments-fastlane-customer-initialize-options';

export default class BigCommercePaymentsFastlaneCustomerStrategy implements CustomerStrategy {
    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private bigCommercePaymentsSdk: PayPalSdkHelper,
        private bigCommercePaymentsFastlaneUtils: BigCommercePaymentsFastlaneUtils,
    ) {}

    async initialize(
        options: CustomerInitializeOptions &
            WithBigCommercePaymentsFastlaneCustomerInitializeOptions,
    ): Promise<void> {
        const { methodId, bigcommerce_payments_fastlane } = options;

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
                state.getPaymentMethodOrThrow<BigCommercePaymentsInitializationData>(methodId);

            const isTestModeEnabled = !!paymentMethod.initializationData?.isDeveloperModeApplicable;

            const paypalFastlaneSdk = await this.bigCommercePaymentsSdk.getPayPalFastlaneSdk(
                paymentMethod,
                cart.currency.code,
                cart.id,
            );

            await this.bigCommercePaymentsFastlaneUtils.initializePayPalFastlane(
                paypalFastlaneSdk,
                isTestModeEnabled,
                this.getFastlaneStyles(methodId, bigcommerce_payments_fastlane),
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

        const { customerContextId } =
            await this.bigCommercePaymentsFastlaneUtils.lookupCustomerOrThrow(customerEmail);

        const authenticationResult =
            await this.bigCommercePaymentsFastlaneUtils.triggerAuthenticationFlowOrThrow(
                customerContextId,
            );

        const isAuthenticationFlowCanceled =
            authenticationResult.authenticationState === PayPalFastlaneAuthenticationState.CANCELED;

        await this.updateCustomerDataState(methodId, authenticationResult);

        if (isAuthenticationFlowCanceled) {
            this.bigCommercePaymentsFastlaneUtils.removeStorageSessionId();
        } else {
            this.bigCommercePaymentsFastlaneUtils.updateStorageSessionId(cartId);
        }
    }

    private async updateCustomerDataState(
        methodId: string,
        authenticationResult: PayPalFastlaneAuthenticationResult,
    ): Promise<void> {
        const state = this.paymentIntegrationService.getState();
        const cart = state.getCartOrThrow();

        const { authenticationState, addresses, billingAddress, shippingAddress, instruments } =
            this.bigCommercePaymentsFastlaneUtils.mapPayPalFastlaneProfileToBcCustomerData(
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
                updatedState.getPaymentMethodOrThrow<BigCommercePaymentsInitializationData>(
                    methodId,
                );
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
        bigcommerce_payments_fastlane:
            | BigCommercePaymentsFastlaneCustomerInitializeOptions
            | undefined,
    ): PayPalFastlaneStylesOption | undefined {
        const state = this.paymentIntegrationService.getState();
        const paymentMethod =
            state.getPaymentMethodOrThrow<BigCommercePaymentsInitializationData>(methodId);

        const { fastlaneStyles, isFastlaneStylingEnabled } = paymentMethod.initializationData || {};

        return getFastlaneStyles(
            isFastlaneStylingEnabled ? fastlaneStyles : {},
            bigcommerce_payments_fastlane?.styles,
        );
    }
}
