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

import BigCommerceIntegrationService from '../big-commerce-integration-service';
import {
    ApproveCallbackPayload,
    BigCommerceButtonsOptions,
    BigCommerceInitializationData,
} from '../big-commerce-types';

import BigCommerceVenmoCustomerInitializeOptions, {
    WithBigCommerceVenmoCustomerInitializeOptions,
} from './big-commerce-venmo-customer-initialize-options';

export default class BigCommerceVenmoCustomerStrategy implements CustomerStrategy {
    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private bigCommerceIntegrationService: BigCommerceIntegrationService,
    ) {}

    async initialize(
        options: CustomerInitializeOptions & WithBigCommerceVenmoCustomerInitializeOptions,
    ): Promise<void> {
        const { bigcommerce_payments_venmo, methodId } = options;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!bigcommerce_payments_venmo) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.bigcommerce_payments_venmo" argument is not provided.',
            );
        }

        if (!bigcommerce_payments_venmo.container) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.bigcommerce_payments_venmo.container" argument is not provided.',
            );
        }

        if (
            bigcommerce_payments_venmo.onClick &&
            typeof bigcommerce_payments_venmo.onClick !== 'function'
        ) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.bigcommerce_payments_venmo.onClick" argument is not a function.',
            );
        }

        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethod(methodId);

        if (!paymentMethod) {
            await this.paymentIntegrationService.loadPaymentMethod(methodId);
        }

        const bigcommerceSdk = await this.bigCommerceIntegrationService.loadBigCommerceSdk(
            methodId,
        );

        if (
            !bigcommerceSdk ||
            !bigcommerceSdk.Buttons ||
            typeof bigcommerceSdk.Buttons !== 'function'
        ) {
            console.error(
                '[BC BigCommerce]: BigCommerce Button could not be rendered, due to issues with loading BigCommerce SDK',
            );

            return;
        }

        this.renderButton(methodId, bigcommerce_payments_venmo);
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
        bigcommerce_payments_venmo: BigCommerceVenmoCustomerInitializeOptions,
    ): void {
        const { container, onClick } = bigcommerce_payments_venmo;

        const bigcommerceSdk = this.bigCommerceIntegrationService.getBigCommerceSdkOrThrow();
        const state = this.paymentIntegrationService.getState();
        const paymentMethod =
            state.getPaymentMethodOrThrow<BigCommerceInitializationData>(methodId);
        const { paymentButtonStyles } = paymentMethod.initializationData || {};
        const { checkoutTopButtonStyles } = paymentButtonStyles || {};

        const buttonRenderOptions: BigCommerceButtonsOptions = {
            fundingSource: bigcommerceSdk.FUNDING.VENMO,
            style: this.bigCommerceIntegrationService.getValidButtonStyle({
                ...checkoutTopButtonStyles,
                height: DefaultCheckoutButtonHeight,
            }),
            createOrder: () =>
                this.bigCommerceIntegrationService.createOrder('bigcommerce_payments_venmo'),
            onApprove: ({ orderID }: ApproveCallbackPayload) =>
                this.bigCommerceIntegrationService.tokenizePayment(methodId, orderID),
            ...(onClick && { onClick: () => onClick() }),
        };

        const bigcommerceButtonRender = bigcommerceSdk.Buttons(buttonRenderOptions);

        if (bigcommerceButtonRender.isEligible()) {
            bigcommerceButtonRender.render(`#${container}`);
        } else {
            this.bigCommerceIntegrationService.removeElement(container);
        }
    }
}
