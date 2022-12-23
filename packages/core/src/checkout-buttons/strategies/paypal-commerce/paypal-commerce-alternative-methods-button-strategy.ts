import { FormPoster } from '@bigcommerce/form-poster';

import { CartRequestSender } from '../../../cart';
import { BuyNowCartCreationError } from '../../../cart/errors';
import { CheckoutActionCreator, CheckoutStore } from '../../../checkout';
import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
} from '../../../common/error/errors';
import { PaymentMethodClientUnavailableError } from '../../../payment/errors';
import {
    ApproveCallbackPayload,
    ButtonsOptions,
    PaypalButtonStyleOptions,
    PaypalCommerceRequestSender,
    PaypalCommerceScriptLoader,
    PaypalCommerceSDK,
} from '../../../payment/strategies/paypal-commerce';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonStrategy from '../checkout-button-strategy';

import getValidButtonStyle from './get-valid-button-style';
import { PaypalCommerceAlternativeMethodsButtonOptions } from './paypal-commerce-alternative-methods-button-options';

export default class PaypalCommerceAlternativeMethodsButtonStrategy
    implements CheckoutButtonStrategy
{
    private _buyNowCartId?: string;
    private _paypalCommerceSdk?: PaypalCommerceSDK;

    constructor(
        private _store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _cartRequestSender: CartRequestSender,
        private _formPoster: FormPoster,
        private _paypalScriptLoader: PaypalCommerceScriptLoader,
        private _paypalCommerceRequestSender: PaypalCommerceRequestSender,
    ) {}

    async initialize(options: CheckoutButtonInitializeOptions): Promise<void> {
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
            const state = this._store.getState();
            const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);

            if (!currencyCode) {
                throw new InvalidArgumentError(
                    `Unable to initialize payment because "options.paypalcommercealternativemethods.currencyCode" argument is not provided.`,
                );
            }

            this._paypalCommerceSdk = await this._paypalScriptLoader.getPayPalSDK(
                paymentMethod,
                currencyCode,
                initializesOnCheckoutPage,
            );
        } else {
            const state = await this._store.dispatch(
                this._checkoutActionCreator.loadDefaultCheckout(),
            );
            const cart = state.cart.getCartOrThrow();
            const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);

            this._paypalCommerceSdk = await this._paypalScriptLoader.getPayPalSDK(
                paymentMethod,
                cart.currency.code,
                initializesOnCheckoutPage,
            );
        }

        this._renderButton(methodId, containerId, paypalcommercealternativemethods);
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private _renderButton(
        methodId: string,
        containerId: string,
        paypalcommercealternativemethods: PaypalCommerceAlternativeMethodsButtonOptions,
    ): void {
        const { apm, buyNowInitializeOptions, initializesOnCheckoutPage, style } =
            paypalcommercealternativemethods;

        const paypalCommerceSdk = this._getPayPalCommerceSdkOrThrow();
        const isAvailableFundingSource = Object.values(paypalCommerceSdk.FUNDING).includes(apm);

        if (!isAvailableFundingSource) {
            throw new InvalidArgumentError(
                `Unable to initialize PayPal button because "options.paypalcommercealternativemethods.apm" argument is not valid funding source.`,
            );
        }

        const validButtonStyle = style ? this._getButtonStyle(style) : {};

        const buttonRenderOptions: ButtonsOptions = {
            fundingSource: apm,
            style: validButtonStyle,
            onClick: () => this._handleClick(buyNowInitializeOptions),
            createOrder: () => this._createOrder(initializesOnCheckoutPage),
            onApprove: ({ orderID }: ApproveCallbackPayload) =>
                this._tokenizePayment(methodId, orderID),
        };

        const paypalButtonRender = paypalCommerceSdk.Buttons(buttonRenderOptions);

        if (paypalButtonRender.isEligible()) {
            paypalButtonRender.render(`#${containerId}`);
        } else {
            this._removeElement(containerId);
        }
    }

    private async _handleClick(
        buyNowInitializeOptions: PaypalCommerceAlternativeMethodsButtonOptions['buyNowInitializeOptions'],
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
                const { body: cart } = await this._cartRequestSender.createBuyNowCart(
                    cartRequestBody,
                );

                this._buyNowCartId = cart.id;
            } catch (error) {
                throw new BuyNowCartCreationError();
            }
        }
    }

    private async _createOrder(initializesOnCheckoutPage?: boolean): Promise<string> {
        const cartId = this._buyNowCartId || this._store.getState().cart.getCartOrThrow().id;

        const providerId = initializesOnCheckoutPage
            ? 'paypalcommercealternativemethodscheckout'
            : 'paypalcommercealternativemethod';

        const { orderId } = await this._paypalCommerceRequestSender.createOrder(providerId, {
            cartId,
        });

        return orderId;
    }

    private _tokenizePayment(methodId: string, orderId?: string): void {
        if (!orderId) {
            throw new MissingDataError(MissingDataErrorType.MissingOrderId);
        }

        return this._formPoster.postForm('/checkout.php', {
            payment_type: 'paypal',
            action: 'set_external_checkout',
            provider: methodId,
            order_id: orderId,
            ...(this._buyNowCartId && { cart_id: this._buyNowCartId }),
        });
    }

    private _getPayPalCommerceSdkOrThrow(): PaypalCommerceSDK {
        if (!this._paypalCommerceSdk) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this._paypalCommerceSdk;
    }

    private _getButtonStyle(style: PaypalButtonStyleOptions): PaypalButtonStyleOptions {
        const { height, label, layout, shape } = getValidButtonStyle(style);

        return { height, label, layout, shape };
    }

    private _removeElement(elementId?: string): void {
        const element = elementId && document.getElementById(elementId);

        if (element) {
            element.remove();
        }
    }
}
