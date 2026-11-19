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
import {
    PaypalButtonCreationService,
    PayPalInitializationData,
    PayPalIntegrationService,
} from '@bigcommerce/checkout-sdk/paypal-utils';

import PayPalCommerceVenmoCustomerInitializeOptions, {
    WithPayPalCommerceVenmoCustomerInitializeOptions,
} from './paypal-commerce-venmo-customer-initialize-options';

export default class PayPalCommerceVenmoCustomerStrategy implements CustomerStrategy {
    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private paypalIntegrationService: PayPalIntegrationService,
        private paypalButtonCreationService: PaypalButtonCreationService,
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

        const paypalSdk = await this.paypalIntegrationService.loadPayPalSdk(methodId);

        if (!paypalSdk || !paypalSdk.Buttons || typeof paypalSdk.Buttons !== 'function') {
            // eslint-disable-next-line no-console
            console.error(
                '[BC PayPal]: PayPal Button could not be rendered, due to issues with loading PayPal SDK',
            );

            return;
        }

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

        const paypalSdk = this.paypalIntegrationService.getPayPalSdkOrThrow();
        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow<PayPalInitializationData>(methodId);
        const { paymentButtonStyles } = paymentMethod.initializationData || {};
        const { checkoutTopButtonStyles } = paymentButtonStyles || {};

        const buttonRenderOptions = {
            fundingSource: paypalSdk.FUNDING.VENMO,
            style: this.paypalIntegrationService.getValidButtonStyle({
                ...checkoutTopButtonStyles,
                height: DefaultCheckoutButtonHeight,
            }),
            ...(onClick && { onClick: () => onClick() }),
        };

        const paypalButton = this.paypalButtonCreationService.createPayPalButton(
            'paypalcommerce',
            methodId,
            buttonRenderOptions,
        );

        if (paypalButton.isEligible()) {
            paypalButton.render(`#${container}`);
        } else {
            this.paypalIntegrationService.removeElement(container);
        }
    }
}
