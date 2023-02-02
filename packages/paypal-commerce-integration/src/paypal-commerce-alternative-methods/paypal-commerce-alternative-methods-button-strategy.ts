import { FormPoster } from '@bigcommerce/form-poster';

import {
    BuyNowCartCreationError,
    CheckoutButtonInitializeOptions,
    CheckoutButtonStrategy,
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    PaymentIntegrationService,
    PaymentMethodClientUnavailableError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import PayPalCommerceRequestSender from '../paypal-commerce-request-sender';
import PayPalCommerceScriptLoader from '../paypal-commerce-script-loader';
import {
    ApproveCallbackPayload,
    PayPalButtonStyleOptions,
    PayPalCommerceButtonsOptions,
    PayPalSDK,
} from '../paypal-commerce-types';
import { getValidButtonStyle } from '../utils';

import PayPalCommerceAlternativeMethodsButtonOptions, {
    WithPayPalCommerceAlternativeMethodsButtonOptions,
} from './paypal-commerce-alternative-methods-button-initialize-options';

export default class PayPalCommerceAlternativeMethodsButtonStrategy
    implements CheckoutButtonStrategy
{
    private buyNowCartId?: string;
    private paypalSdk?: PayPalSDK;

    constructor(
        private formPoster: FormPoster,
        private paymentIntegrationService: PaymentIntegrationService,
        private paypalCommerceRequestSender: PayPalCommerceRequestSender,
        private paypalCommerceScriptLoader: PayPalCommerceScriptLoader,
    ) {}

    async initialize(
        options: CheckoutButtonInitializeOptions &
            WithPayPalCommerceAlternativeMethodsButtonOptions,
    ): Promise<void> {
        const { paypalcommercealternativemethods, containerId, methodId } = options;

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

        if (!paypalcommercealternativemethods) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.paypalcommercealternativemethods" argument is not provided.`,
            );
        }

        if (!paypalcommercealternativemethods.apm) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.paypalcommercealternativemethods.apm" argument is not provided.`,
            );
        }

        const { buyNowInitializeOptions, currencyCode, initializesOnCheckoutPage } =
            paypalcommercealternativemethods;

        if (buyNowInitializeOptions) {
            const state = this.paymentIntegrationService.getState();
            const paymentMethod = state.getPaymentMethodOrThrow(methodId);

            if (!currencyCode) {
                throw new InvalidArgumentError(
                    `Unable to initialize payment because "options.paypalcommercevenmo.currencyCode" argument is not provided.`,
                );
            }

            this.paypalSdk = await this.paypalCommerceScriptLoader.getPayPalSDK(
                paymentMethod,
                currencyCode,
                initializesOnCheckoutPage,
            );
        } else {
            await this.paymentIntegrationService.loadDefaultCheckout();

            const state = this.paymentIntegrationService.getState();
            const cart = state.getCartOrThrow();
            const paymentMethod = state.getPaymentMethodOrThrow(methodId);

            this.paypalSdk = await this.paypalCommerceScriptLoader.getPayPalSDK(
                paymentMethod,
                cart.currency.code,
                initializesOnCheckoutPage,
            );
        }

        this.renderButton(containerId, methodId, paypalcommercealternativemethods);
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private renderButton(
        containerId: string,
        methodId: string,
        paypalcommercealternativemethods: PayPalCommerceAlternativeMethodsButtonOptions,
    ): void {
        const { apm, buyNowInitializeOptions, initializesOnCheckoutPage, style } =
            paypalcommercealternativemethods;

        const paypalSdk = this.getPayPalSdkOrThrow();
        const isAvailableFundingSource = Object.values(paypalSdk.FUNDING).includes(apm);

        if (!isAvailableFundingSource) {
            throw new InvalidArgumentError(
                `Unable to initialize PayPal button because "options.paypalcommercealternativemethods.apm" argument is not valid funding source.`,
            );
        }

        const validButtonStyle = style ? this.getButtonStyle(style) : {};

        const buttonRenderOptions: PayPalCommerceButtonsOptions = {
            fundingSource: apm,
            style: validButtonStyle,
            onClick: () => this.handleClick(buyNowInitializeOptions),
            createOrder: () => this.createOrder(initializesOnCheckoutPage),
            onApprove: ({ orderID }: ApproveCallbackPayload) =>
                this.tokenizePayment(methodId, orderID),
        };

        const paypalButtonRender = paypalSdk.Buttons(buttonRenderOptions);

        if (paypalButtonRender.isEligible()) {
            paypalButtonRender.render(`#${containerId}`);
        } else {
            this.removeElement(containerId);
        }
    }

    private async handleClick(
        buyNowInitializeOptions: PayPalCommerceAlternativeMethodsButtonOptions['buyNowInitializeOptions'],
    ): Promise<void> {
        if (
            buyNowInitializeOptions &&
            typeof buyNowInitializeOptions.getBuyNowCartRequestBody === 'function'
        ) {
            const cartRequestBody = buyNowInitializeOptions.getBuyNowCartRequestBody();

            if (!cartRequestBody) {
                throw new MissingDataError(MissingDataErrorType.MissingCart);
            }

            try {
                const buyNowCart = await this.paymentIntegrationService.createBuyNowCart(
                    cartRequestBody,
                );

                this.buyNowCartId = buyNowCart.id;
            } catch (error) {
                throw new BuyNowCartCreationError();
            }
        }
    }

    private async createOrder(initializesOnCheckoutPage?: boolean): Promise<string> {
        const cartId =
            this.buyNowCartId || this.paymentIntegrationService.getState().getCartOrThrow().id;

        const providerId = initializesOnCheckoutPage
            ? 'paypalcommercealternativemethodscheckout'
            : 'paypalcommercealternativemethod';

        const { orderId } = await this.paypalCommerceRequestSender.createOrder(providerId, {
            cartId,
        });

        return orderId;
    }

    private tokenizePayment(methodId: string, orderId?: string): void {
        if (!orderId) {
            throw new MissingDataError(MissingDataErrorType.MissingOrderId);
        }

        return this.formPoster.postForm('/checkout.php', {
            payment_type: 'paypal',
            action: 'set_external_checkout',
            provider: methodId,
            order_id: orderId,
            ...(this.buyNowCartId && { cart_id: this.buyNowCartId }),
        });
    }

    private getPayPalSdkOrThrow(): PayPalSDK {
        if (!this.paypalSdk) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.paypalSdk;
    }

    private getButtonStyle(style: PayPalButtonStyleOptions): PayPalButtonStyleOptions {
        const { height, label, layout, shape } = getValidButtonStyle(style);

        return { height, label, layout, shape };
    }

    private removeElement(elementId?: string): void {
        const element = elementId && document.getElementById(elementId);

        if (element) {
            element.remove();
        }
    }
}
