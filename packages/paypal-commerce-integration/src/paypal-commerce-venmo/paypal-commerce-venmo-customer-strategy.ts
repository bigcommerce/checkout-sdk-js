import {
    CustomerCredentials,
    CustomerInitializeOptions,
    CustomerStrategy,
    DefaultCheckoutButtonHeight,
    ExecutePaymentMethodCheckoutOptions,
    InvalidArgumentError,
    PaymentIntegrationService,
    RequestOptions,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import PayPalCommerceIntegrationService from '../paypal-commerce-integration-service';
import {
    ApproveCallbackPayload,
    PayPalCommerceButtonsOptions,
    PayPalCommerceInitializationData,
} from '../paypal-commerce-types';

import PayPalCommerceVenmoCustomerInitializeOptions, {
    WithPayPalCommerceVenmoCustomerInitializeOptions,
} from './paypal-commerce-venmo-customer-initialize-options';

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
                'Unable to initialize payment because "options.paypalcommercevenmo" argument is not provided.',
            );
        }

        if (!paypalcommercevenmo.container) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.paypalcommercevenmo.container" argument is not provided.',
            );
        }

        if (paypalcommercevenmo.onClick && typeof paypalcommercevenmo.onClick !== 'function') {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.paypalcommercevenmo.onClick" argument is not a function.',
            );
        }

        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethod(methodId);

        if (!paymentMethod) {
            await this.paymentIntegrationService.loadPaymentMethod(methodId);
        }

        await this.paypalCommerceIntegrationService.loadPayPalSdk(methodId);

        this.renderButton(methodId, paypalcommercevenmo);
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

    private renderButton(
        methodId: string,
        paypalcommercevenmo: PayPalCommerceVenmoCustomerInitializeOptions,
    ): void {
        const { container, onClick } = paypalcommercevenmo;

        const paypalSdk = this.paypalCommerceIntegrationService.getPayPalSdkOrThrow();
        const state = this.paymentIntegrationService.getState();
        const paymentMethod =
            state.getPaymentMethodOrThrow<PayPalCommerceInitializationData>(methodId);
        const { paymentButtonStyles } = paymentMethod.initializationData || {};
        const { checkoutTopButtonStyles } = paymentButtonStyles || {};

        const buttonRenderOptions: PayPalCommerceButtonsOptions = {
            fundingSource: paypalSdk.FUNDING.VENMO,
            style: this.paypalCommerceIntegrationService.getValidButtonStyle({
                ...checkoutTopButtonStyles,
                height: DefaultCheckoutButtonHeight,
            }),
            createOrder: () =>
                this.paypalCommerceIntegrationService.createOrder('paypalcommercevenmo'),
            onApprove: ({ orderID }: ApproveCallbackPayload) =>
                this.paypalCommerceIntegrationService.tokenizePayment(methodId, orderID),
            ...(onClick && { onClick: () => onClick() }),
        };

        const paypalButtonRender = paypalSdk.Buttons(buttonRenderOptions);

        if (paypalButtonRender.isEligible()) {
            paypalButtonRender.render(`#${container}`);
        } else {
            this.paypalCommerceIntegrationService.removeElement(container);
        }
    }
}
