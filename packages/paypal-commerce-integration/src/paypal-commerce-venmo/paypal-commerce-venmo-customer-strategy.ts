import {
    CustomerCredentials,
    CustomerInitializeOptions,
    CustomerStrategy,
    ExecutePaymentMethodCheckoutOptions,
    InvalidArgumentError,
    PaymentIntegrationService,
    RequestOptions,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import PayPalCommerceIntegrationService from '../paypal-commerce-integration-service';
import { ApproveCallbackPayload, PayPalCommerceButtonsOptions } from '../paypal-commerce-types';

import { WithPayPalCommerceVenmoCustomerInitializeOptions } from './paypal-commerce-venmo-customer-initialize-options';

export default class PayPalCommerceVenmoCustomerStrategy implements CustomerStrategy {
    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private paypalCommerceIntegrationService: PayPalCommerceIntegrationService,
    ) {}

    async initialize(
        options: CustomerInitializeOptions & WithPayPalCommerceVenmoCustomerInitializeOptions,
    ): Promise<void> {
        const { paypalcommercevenmo, methodId } = options;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!paypalcommercevenmo) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "paypalcommercevenmo" argument is not provided.`,
            );
        }

        if (!paypalcommercevenmo.container) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "paypalcommercevenmo.container" argument is not provided.`,
            );
        }

        await this.paymentIntegrationService.loadPaymentMethod(methodId);
        await this.paypalCommerceIntegrationService.loadPayPalSdk(methodId);

        this.renderButton(methodId, paypalcommercevenmo.container);
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    async signIn(credentials: CustomerCredentials, options?: RequestOptions): Promise<void> {
        await this.paymentIntegrationService.signInCustomer(credentials, options);
    }

    async signOut(options?: RequestOptions): Promise<void> {
        await this.paymentIntegrationService.signOutCustomer(options);
    }

    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<void> {
        options?.continueWithCheckoutCallback?.();

        return Promise.resolve();
    }

    private renderButton(methodId: string, containerId: string): void {
        const paypalSdk = this.paypalCommerceIntegrationService.getPayPalSdkOrThrow();

        const buttonRenderOptions: PayPalCommerceButtonsOptions = {
            fundingSource: paypalSdk.FUNDING.VENMO,
            style: this.paypalCommerceIntegrationService.getValidButtonStyle(),
            createOrder: () =>
                this.paypalCommerceIntegrationService.createOrder('paypalcommercevenmo'),
            onApprove: ({ orderID }: ApproveCallbackPayload) =>
                this.paypalCommerceIntegrationService.tokenizePayment(methodId, orderID),
        };

        const paypalButtonRender = paypalSdk.Buttons(buttonRenderOptions);

        if (paypalButtonRender.isEligible()) {
            paypalButtonRender.render(`#${containerId}`);
        } else {
            this.paypalCommerceIntegrationService.removeElement(containerId);
        }
    }
}
