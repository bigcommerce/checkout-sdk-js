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
    PayPalButtonOptions,
    PayPalInitializationData,
    PayPalIntegrationService,
} from '@bigcommerce/checkout-sdk/paypal-utils';

import PayPalCommerceCustomerInitializeOptions, {
    WithPayPalCommerceCustomerInitializeOptions,
} from './paypal-commerce-customer-initialize-options';

export default class PayPalCommerceCustomerStrategy implements CustomerStrategy {
    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private paypalIntegrationService: PayPalIntegrationService,
        private paypalButtonCreationService: PaypalButtonCreationService,
    ) {}

    async initialize(
        options: CustomerInitializeOptions & WithPayPalCommerceCustomerInitializeOptions,
    ): Promise<void> {
        const { paypalcommerce, methodId } = options;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!paypalcommerce) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.paypalcommerce" argument is not provided.',
            );
        }

        if (!paypalcommerce.container) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.paypalcommerce.container" argument is not provided.',
            );
        }

        if (paypalcommerce.onClick && typeof paypalcommerce.onClick !== 'function') {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.paypalcommerce.onClick" argument is not a function.',
            );
        }

        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethod(methodId);

        if (!paymentMethod) {
            await this.paymentIntegrationService.loadPaymentMethod(methodId);
        }

        const paypalSdk = await this.paypalIntegrationService.loadPayPalSdk(methodId);

        if (!paypalSdk || !paypalSdk.Buttons || typeof paypalSdk.Buttons !== 'function') {
            console.error(
                '[BC PayPal]: PayPal Button could not be rendered, due to issues with loading PayPal SDK',
            );

            return;
        }

        this.renderButton(methodId, paypalcommerce);
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    async signIn(credentials: CustomerCredentials, options?: RequestOptions): Promise<void> {
        await this.paymentIntegrationService.signInCustomer(credentials, options);

        return Promise.resolve();
    }

    async signOut(options?: RequestOptions): Promise<void> {
        await this.paymentIntegrationService.signOutCustomer(options);

        return Promise.resolve();
    }

    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<void> {
        options?.continueWithCheckoutCallback?.();

        return Promise.resolve();
    }

    private renderButton(
        methodId: string,
        paypalcommerce: PayPalCommerceCustomerInitializeOptions,
    ): void {
        const { container, onClick, onComplete, onError } = paypalcommerce;

        const paypalSdk = this.paypalIntegrationService.getPayPalSdkOrThrow();
        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow<PayPalInitializationData>(methodId);
        const {
            isHostedCheckoutEnabled,
            paymentButtonStyles,
            isServerSideShippingCallbacksEnabled,
        } = paymentMethod.initializationData || {};
        const { checkoutTopButtonStyles } = paymentButtonStyles || {};

        const buttonOptions: PayPalButtonOptions = {
            fundingSource: paypalSdk.FUNDING.PAYPAL,
            isServerSideShippingCallbacksEnabled,
            isHostedCheckoutEnabled,
            style: {
                ...checkoutTopButtonStyles,
                height: DefaultCheckoutButtonHeight,
            },
            ...(onClick && { onClick: () => onClick() }),
            ...(isHostedCheckoutEnabled && onComplete && { onPaymentComplete: () => onComplete() }),
            onError,
        };

        const paypalButton = this.paypalButtonCreationService.createPayPalButton(
            'paypalcommerce',
            methodId,
            buttonOptions,
        );

        if (paypalButton.isEligible()) {
            if (paypalButton.hasReturned?.() && isServerSideShippingCallbacksEnabled) {
                paypalButton.resume?.();
            } else {
                paypalButton.render(`#${container}`);
            }
        } else {
            this.paypalIntegrationService.removeElement(container);
        }
    }
}
