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
        const { bigcommercevenmo, methodId } = options;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!bigcommercevenmo) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.bigcommercevenmo" argument is not provided.',
            );
        }

        if (!bigcommercevenmo.container) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.bigcommercevenmo.container" argument is not provided.',
            );
        }

        if (bigcommercevenmo.onClick && typeof bigcommercevenmo.onClick !== 'function') {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.bigcommercevenmo.onClick" argument is not a function.',
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

        this.renderButton(methodId, bigcommercevenmo);
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
        bigcommercevenmo: BigCommerceVenmoCustomerInitializeOptions,
    ): void {
        const { container, onClick } = bigcommercevenmo;

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
            createOrder: () => this.bigCommerceIntegrationService.createOrder('bigcommercevenmo'),
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
