import {
    CustomerCredentials,
    CustomerInitializeOptions,
    CustomerStrategy,
    ExecutePaymentMethodCheckoutOptions,
    InvalidArgumentError,
    PaymentIntegrationService,
    RequestOptions,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BraintreeAcceleratedCheckoutUtils from './braintree-accelerated-checkout-utils';

export default class BraintreeAcceleratedCheckoutCustomerStrategy implements CustomerStrategy {
    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private braintreeAcceleratedCheckoutUtils: BraintreeAcceleratedCheckoutUtils,
    ) {}

    /**
     *
     * Default methods
     *
     */
    async initialize({ methodId }: CustomerInitializeOptions): Promise<void> {
        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to proceed because "methodId" argument is not provided.',
            );
        }

        await this.paymentIntegrationService.loadPaymentMethod(methodId);
        await this.braintreeAcceleratedCheckoutUtils.initializeBraintreeConnectOrThrow(methodId);
    }

    async deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    async signIn(credentials: CustomerCredentials, options?: RequestOptions): Promise<void> {
        await this.paymentIntegrationService.signInCustomer(credentials, options);
        await this.braintreeAcceleratedCheckoutUtils.authenticatePayPalConnectUserOrThrow(
            credentials.email,
        );
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

        await this.braintreeAcceleratedCheckoutUtils.authenticatePayPalConnectUserOrThrow();

        continueWithCheckoutCallback();
    }
}
