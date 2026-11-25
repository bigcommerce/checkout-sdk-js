import {
    BraintreeInitializationData,
    getFastlaneStyles,
    isBraintreeAcceleratedCheckoutCustomer,
    isBraintreeFastlaneKnownShoppersEnabled,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    CustomerCredentials,
    CustomerInitializeOptions,
    CustomerStrategy,
    ExecutePaymentMethodCheckoutOptions,
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    PaymentIntegrationService,
    PaymentMethod,
    RequestOptions,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { WithBraintreeFastlaneCustomerInitializeOptions } from './braintree-fastlane-customer-initialize-options';
import BraintreeFastlaneUtils from './braintree-fastlane-utils';

export default class BraintreeFastlaneCustomerStrategy implements CustomerStrategy {
    private isAcceleratedCheckoutEnabled = false;
    private onErrorLog?: (error: unknown) => void;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private braintreeFastlaneUtils: BraintreeFastlaneUtils,
    ) {}

    async initialize({
        methodId,
        braintreefastlane,
        onErrorLog,
    }: CustomerInitializeOptions & WithBraintreeFastlaneCustomerInitializeOptions): Promise<void> {
        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to proceed because "methodId" argument is not provided.',
            );
        }

        const paymentMethod = await this.getValidPaymentMethodOrThrow(methodId);

        const { isAcceleratedCheckoutEnabled, isFastlaneStylingEnabled } =
            paymentMethod.initializationData || {};

        const paypalFastlaneStylesSettings = isFastlaneStylingEnabled
            ? paymentMethod.initializationData?.fastlaneStyles
            : undefined;

        this.isAcceleratedCheckoutEnabled = !!isAcceleratedCheckoutEnabled;
        this.onErrorLog = onErrorLog;

        try {
            if (this.isAcceleratedCheckoutEnabled) {
                const fastlaneStyles = getFastlaneStyles(
                    paypalFastlaneStylesSettings,
                    braintreefastlane?.styles,
                );

                await this.braintreeFastlaneUtils.initializeBraintreeFastlaneOrThrow(
                    paymentMethod.id,
                    fastlaneStyles,
                );

                // Info: known (logged in) shoppers do not pass the guest email step,
                // so the Fastlane OTP is shown right after the strategy initialization for them
                await this.runAuthenticationFlowForKnownShopper();
            }
        } catch (error) {
            // Info: Do not throw anything here to avoid blocking customer from passing checkout flow
            const isMissingPaymentMethodError =
                error instanceof MissingDataError &&
                error.subtype === MissingDataErrorType.MissingPaymentMethod;

            if (!isMissingPaymentMethodError) {
                this.handleErrorLog(error);
            }
        }

        return Promise.resolve();
    }

    async deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    async signIn(credentials: CustomerCredentials, options?: RequestOptions): Promise<void> {
        await this.paymentIntegrationService.signInCustomer(credentials, options);

        // Info: show Fastlane OTP right after login on the checkout page
        // Do not throw anything here to avoid blocking customer from passing checkout flow
        try {
            await this.runAuthenticationFlowForKnownShopper();
        } catch (error) {
            this.handleErrorLog(error);
        }
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

        // Info: this method is called only from the guest customer step (email form),
        // so there is no need to check that the customer is a guest here
        if (this.isAcceleratedCheckoutEnabled) {
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
                    { onErrorLog: this.onErrorLog },
                );
            }
        }

        continueWithCheckoutCallback();
    }

    private async runAuthenticationFlowForKnownShopper(): Promise<void> {
        if (!(await this.shouldRunAuthenticationFlowForKnownShopper())) {
            return;
        }

        await this.braintreeFastlaneUtils.runPayPalAuthenticationFlowOrThrow(undefined, true, {
            onErrorLog: this.onErrorLog,
        });
    }

    private async shouldRunAuthenticationFlowForKnownShopper(): Promise<boolean> {
        const state = this.paymentIntegrationService.getState();
        const customer = state.getCustomer();
        const features = state.getStoreConfig()?.checkoutSettings.features;
        const paymentProviderCustomer = state.getPaymentProviderCustomer();
        const authenticationState = isBraintreeAcceleratedCheckoutCustomer(paymentProviderCustomer)
            ? paymentProviderCustomer.authenticationState
            : undefined;

        // Info: guests are authenticated after the email step (executePaymentMethodCheckout),
        // so this flow is only for known (logged in) shoppers
        if (
            !this.isAcceleratedCheckoutEnabled ||
            !customer ||
            customer.isGuest ||
            !isBraintreeFastlaneKnownShoppersEnabled(features) ||
            authenticationState
        ) {
            return false;
        }

        return this.shouldRunAuthenticationFlow();
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
        } catch {
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

    private handleErrorLog(error: unknown): void {
        if (this.onErrorLog && typeof this.onErrorLog === 'function') {
            this.onErrorLog(error);
        }
    }
}
