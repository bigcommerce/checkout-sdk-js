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
    PayPalCommerceConnectAuthenticationResult,
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
            isDeveloperModeApplicable,
            isFastlaneEnabled, // TODO: remove this line when fastlane experiment will be rolled out to 100%
        } = paymentMethod.initializationData || {};

        this.isAcceleratedCheckoutFeatureEnabled = !!isAcceleratedCheckoutEnabled;

        if (this.isAcceleratedCheckoutFeatureEnabled) {
            const state = this.paymentIntegrationService.getState();
            const currency = state.getCartOrThrow().currency.code;
            const isTestModeEnabled = !!isDeveloperModeApplicable;

            if (isFastlaneEnabled) {
                const paypalFastlaneSdk = await this.paypalCommerceSdk.getPayPalFastlaneSdk(
                    paymentMethod,
                    currency,
                );

                await this.paypalCommerceFastlaneUtils.initializePayPalFastlane(
                    paypalFastlaneSdk,
                    isTestModeEnabled,
                    paypalcommercefastlane?.styles,
                );
            } else {
                const paypalAxoSdk = await this.paypalCommerceSdk.getPayPalAxo(
                    paymentMethod,
                    currency,
                );

                await this.paypalCommerceFastlaneUtils.initializePayPalConnect(
                    paypalAxoSdk,
                    isTestModeEnabled,
                    paypalcommercefastlane?.styles,
                );
            }
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
            const cartId = state.getCartOrThrow().id;
            const customer = state.getCustomer();
            const billingAddress = state.getBillingAddress();
            const paymentMethod = state.getPaymentMethodOrThrow<PayPalCommerceInitializationData>(
                this.primaryMethodId,
            );
            const isFastlaneEnabled = !!paymentMethod.initializationData?.isFastlaneEnabled;
            const customerEmail = customer?.email || billingAddress?.email || '';

            const { customerContextId } = isFastlaneEnabled
                ? await this.paypalCommerceFastlaneUtils.lookupCustomerOrThrow(customerEmail)
                : await this.paypalCommerceFastlaneUtils.connectLookupCustomerOrThrow(
                      customerEmail,
                  );

            const authenticationResult = isFastlaneEnabled
                ? await this.paypalCommerceFastlaneUtils.triggerAuthenticationFlowOrThrow(
                      customerContextId,
                  )
                : await this.paypalCommerceFastlaneUtils.connectTriggerAuthenticationFlowOrThrow(
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
        } catch (error) {
            // Info: Do not throw anything here to avoid blocking customer from passing checkout flow
        }
    }

    private async updateCustomerDataState(
        methodId: string,
        authenticationResult:
            | PayPalCommerceConnectAuthenticationResult
            | PayPalFastlaneAuthenticationResult,
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
