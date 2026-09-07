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

import PayPalCommerceCreditCustomerInitializeOptions, {
    WithPayPalCommerceCreditCustomerInitializeOptions,
} from './paypal-commerce-credit-customer-initialize-options';

export default class PayPalCommerceCreditCustomerStrategy implements CustomerStrategy {
    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private paypalIntegrationService: PayPalIntegrationService,
        private paypalButtonCreationService: PaypalButtonCreationService,
    ) {}

    async initialize(
        options: CustomerInitializeOptions & WithPayPalCommerceCreditCustomerInitializeOptions,
    ): Promise<void> {
        const { paypalcommercecredit, methodId } = options;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!paypalcommercecredit) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.paypalcommercecredit" argument is not provided.',
            );
        }

        if (!paypalcommercecredit.container) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.paypalcommercecredit.container" argument is not provided.',
            );
        }

        if (paypalcommercecredit.onClick && typeof paypalcommercecredit.onClick !== 'function') {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.paypalcommercecredit.onClick" argument is not a function.',
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

        this.renderButton(methodId, paypalcommercecredit);
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
        paypalCommerceCredit: PayPalCommerceCreditCustomerInitializeOptions,
    ): void {
        const { container, onComplete, onClick, onError } = paypalCommerceCredit;

        const paypalSdk = this.paypalIntegrationService.getPayPalSdkOrThrow();
        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow<PayPalInitializationData>(methodId);
        const {
            isHostedCheckoutEnabled,
            paymentButtonStyles,
            isServerSideShippingCallbacksEnabled,
        } = paymentMethod.initializationData || {};
        const { checkoutTopButtonStyles } = paymentButtonStyles || {};

        const fundingSources = [paypalSdk.FUNDING.PAYLATER, paypalSdk.FUNDING.CREDIT];
        let hasRenderedSmartButton = false;

        fundingSources.forEach((fundingSource) => {
            if (!hasRenderedSmartButton) {
                const buttonRenderOptions = {
                    fundingSource,
                    style: this.paypalIntegrationService.getValidButtonStyle({
                        ...checkoutTopButtonStyles,
                        height: DefaultCheckoutButtonHeight,
                    }),
                    isHostedCheckoutEnabled,
                    isServerSideShippingCallbacksEnabled,
                    ...(isHostedCheckoutEnabled &&
                        onComplete && { onPaymentComplete: () => onComplete() }),
                    ...(onClick && { onClick: () => onClick() }),
                    onError,
                };

                const paypalButton = this.paypalButtonCreationService.createPayPalButton(
                    'paypalcommerce',
                    methodId,
                    buttonRenderOptions,
                );

                if (paypalButton.isEligible()) {
                    paypalButton.render(`#${container}`);
                    hasRenderedSmartButton = true;
                }
            }
        });

        if (!hasRenderedSmartButton) {
            this.paypalIntegrationService.removeElement(container);
        }
    }
}
