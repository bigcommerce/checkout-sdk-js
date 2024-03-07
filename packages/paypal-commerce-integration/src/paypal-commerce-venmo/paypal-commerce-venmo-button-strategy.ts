import {
    CheckoutButtonInitializeOptions,
    CheckoutButtonStrategy,
    InvalidArgumentError,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import PayPalCommerceButton from '../paypal-commerce-button';
import PayPalCommerceIntegrationService from '../paypal-commerce-integration-service';
import {
    ApproveCallbackPayload,
    PayPalButtonStyleOptions,
    PayPalBuyNowInitializeOptions,
    PayPalCommerceButtonsOptions,
    StyleButtonColor,
} from '../paypal-commerce-types';

import PayPalCommerceVenmoButtonInitializeOptions, {
    WithPayPalCommerceVenmoButtonInitializeOptions,
} from './paypal-commerce-venmo-button-initialize-options';

export default class PayPalCommerceVenmoButtonStrategy implements CheckoutButtonStrategy {
    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private paypalCommerceIntegrationService: PayPalCommerceIntegrationService,
        private paypalCommerceButton: PayPalCommerceButton
    ) {}

    async initialize(
        options: CheckoutButtonInitializeOptions & WithPayPalCommerceVenmoButtonInitializeOptions,
    ): Promise<void> {
        const { paypalcommercevenmo, containerId, methodId } = options;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!containerId) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.containerId" argument is not provided.`,
            );
        }

        if (!paypalcommercevenmo) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.paypalcommercevenmo" argument is not provided.`,
            );
        }

        if (paypalcommercevenmo.buyNowInitializeOptions) {
            await this.initializeAsBuyNowFlowOrThrow(methodId, paypalcommercevenmo);
        } else {
            await this.initializeAsDefaultFlow(methodId);
        }

        // this.renderButton(containerId, methodId, paypalcommercevenmo);
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private async initializeAsDefaultFlow(methodId: string): Promise<void> {
        await this.paymentIntegrationService.loadDefaultCheckout();

        const state = this.paymentIntegrationService.getState();
        const currencyCode = state.getCartOrThrow().currency.code;

        await this.paypalCommerceIntegrationService.loadPayPalSdk(methodId, currencyCode, false);

        this.paypalCommerceButton.render({});
    }

    private async initializeAsBuyNowFlowOrThrow(
        methodId: string,
        paypalcommercevenmo: PayPalCommerceVenmoButtonInitializeOptions,
    ): Promise<void> {
        const { buyNowInitializeOptions, currencyCode } = paypalcommercevenmo;

        if (
            buyNowInitializeOptions &&
            typeof buyNowInitializeOptions?.getBuyNowCartRequestBody !== 'function'
        ) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.paypalcommercevenmo.buyNowInitializeOptions.getBuyNowCartRequestBody" argument is not provided or it is not a function.`,
            );
        }

        if (!currencyCode) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.paypalcommercevenmo.currencyCode" argument is not provided.`,
            );
        }

        await this.paypalCommerceIntegrationService.loadPayPalSdk(methodId, currencyCode, false);

        this.paypalCommerceButton.render({});
    }

    private renderButton(
        containerId: string,
        methodId: string,
        paypalcommercevenmo: PayPalCommerceVenmoButtonInitializeOptions,
    ): void {
        const { buyNowInitializeOptions, style } = paypalcommercevenmo;

        const paypalSdk = this.paypalCommerceIntegrationService.getPayPalSdkOrThrow();
        const fundingSource = paypalSdk.FUNDING.VENMO;

        const defaultCallbacks = {
            createOrder: () =>
                this.paypalCommerceIntegrationService.createOrder('paypalcommercevenmo'),
            onApprove: ({ orderID }: ApproveCallbackPayload) =>
                this.paypalCommerceIntegrationService.tokenizePayment(methodId, orderID),
        };

        const buyNowFlowCallbacks = {
            onClick: () => this.handleClick(buyNowInitializeOptions),
            onCancel: () => this.paymentIntegrationService.loadDefaultCheckout(),
        };

        const buttonRenderOptions: PayPalCommerceButtonsOptions = {
            fundingSource,
            style: this.getValidVenmoButtonStyles(style),
            ...defaultCallbacks,
            ...(buyNowInitializeOptions && buyNowFlowCallbacks),
        };

        this.paypalCommerceButton.render({
            containerId,
            paypalSdk,
            config: buttonRenderOptions,
            onEligibleFailed: () => {
                this.paypalCommerceIntegrationService.removeElement(containerId);
            },
        });
    }

    private getValidVenmoButtonStyles(style: PayPalButtonStyleOptions | undefined) {
        const validButtonStyle = this.paypalCommerceButton.getValidButtonStyle(style);

        if (validButtonStyle.color === StyleButtonColor.gold) {
            return {
                ...validButtonStyle,
                color: undefined,
            };
        }

        return validButtonStyle;
    }

    private async handleClick(
        buyNowInitializeOptions?: PayPalBuyNowInitializeOptions,
    ): Promise<void> {
        if (buyNowInitializeOptions) {
            const buyNowCart = await this.paypalCommerceIntegrationService.createBuyNowCartOrThrow(
                buyNowInitializeOptions,
            );

            await this.paymentIntegrationService.loadCheckout(buyNowCart.id);
        }
    }
}
