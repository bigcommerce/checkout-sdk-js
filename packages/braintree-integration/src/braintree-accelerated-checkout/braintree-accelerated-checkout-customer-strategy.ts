import {
    CustomerCredentials,
    CustomerInitializeOptions,
    CustomerStrategy,
    ExecutePaymentMethodCheckoutOptions,
    InvalidArgumentError,
    PaymentIntegrationService,
    RequestOptions,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { BraintreeInitializationData } from '../braintree';

import BraintreeAcceleratedCheckoutUtils from './braintree-accelerated-checkout-utils';

export default class BraintreeAcceleratedCheckoutCustomerStrategy implements CustomerStrategy {
    private methodId?: string;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private braintreeAcceleratedCheckoutUtils: BraintreeAcceleratedCheckoutUtils,
    ) {}

    async initialize({ methodId }: CustomerInitializeOptions): Promise<void> {
        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to proceed because "methodId" argument is not provided.',
            );
        }

        this.methodId = methodId;

        return Promise.resolve();
    }

    async deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    async signIn(credentials: CustomerCredentials, options?: RequestOptions): Promise<void> {
        await this.paymentIntegrationService.signInCustomer(credentials, options);

        if (await this.shouldRunAuthenticationFlow()) {
            await this.runPayPalConnectAuthenticationFlowOrThrow(credentials.email);
        }
    }

    async signOut(options?: RequestOptions): Promise<void> {
        await this.paymentIntegrationService.signOutCustomer(options);
    }

    async executePaymentMethodCheckout(
        options?: ExecutePaymentMethodCheckoutOptions,
    ): Promise<void> {
        const { continueWithCheckoutCallback } = options || {};

        if (typeof continueWithCheckoutCallback !== 'function') {
            throw new InvalidArgumentError(
                'Unable to proceed because "continueWithCheckoutCallback" argument is not provided and it must be a function.',
            );
        }

        if (await this.shouldRunAuthenticationFlow()) {
            await this.runPayPalConnectAuthenticationFlowOrThrow();
        }

        continueWithCheckoutCallback();
    }

    // Info: we should load payment method and check the shouldRunAcceleratedCheckout flag only for A/B testing purposes
    // when the A/B testing finished, we can move paymentIntegrationService.loadPaymentMethod and
    // braintreeAcceleratedCheckoutUtils.initializeBraintreeConnectOrThrow to the initialize method
    private async shouldRunAuthenticationFlow(): Promise<boolean> {
        let isBackupPaymentMethodLoaded = false;

        const methodId = this.getMethodIdOrThrow();
        const backupMethodId =
            methodId === 'braintree' ? 'braintreeacceleratedcheckout' : 'braintree';

        try {
            await this.paymentIntegrationService.loadPaymentMethod(methodId);
        } catch (error) {
            // Info: we should load backup payment method for cases when major one was disabled
            // due to the A/B testing flow (customer enters another email that
            // triggers another A/B testing flow).
            await this.paymentIntegrationService.loadPaymentMethod(backupMethodId);

            isBackupPaymentMethodLoaded = true;
        }

        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow<BraintreeInitializationData>(
            isBackupPaymentMethodLoaded ? backupMethodId : methodId,
        );
        const { shouldRunAcceleratedCheckout, isAcceleratedCheckoutEnabled } =
            paymentMethod.initializationData || {};

        return !!(isAcceleratedCheckoutEnabled && shouldRunAcceleratedCheckout);
    }

    private async runPayPalConnectAuthenticationFlowOrThrow(email?: string): Promise<void> {
        const methodId = this.getMethodIdOrThrow();

        await this.braintreeAcceleratedCheckoutUtils.initializeBraintreeConnectOrThrow(methodId);
        await this.braintreeAcceleratedCheckoutUtils.runPayPalConnectAuthenticationFlowOrThrow(
            email,
        );
    }

    private getMethodIdOrThrow(): string {
        if (!this.methodId) {
            throw new InvalidArgumentError(
                'Unable to proceed because "methodId" argument is not provided.',
            );
        }

        return this.methodId;
    }
}
