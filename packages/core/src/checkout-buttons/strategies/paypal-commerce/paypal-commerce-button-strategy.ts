import { FormPoster } from '@bigcommerce/form-poster';

import { CartRequestSender } from '../../../cart';
import { BuyNowCartCreationError } from '../../../cart/errors';
import { CheckoutActionCreator, CheckoutStore } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, } from '../../../common/error/errors';
import { PaymentMethodClientUnavailableError } from '../../../payment/errors';
import { ApproveDataOptions, ButtonsOptions, PaypalButtonStyleOptions, PaypalCommerceRequestSender, PaypalCommerceScriptLoader, PaypalCommerceSDK } from '../../../payment/strategies/paypal-commerce';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonStrategy from '../checkout-button-strategy';

import getValidButtonStyle from './get-valid-button-style';
import { PaypalCommerceButtonInitializeOptions } from './paypal-commerce-button-options';

export default class PaypalCommerceButtonStrategy implements CheckoutButtonStrategy {
    private _buyNowCartId?: string;
    private _paypalCommerceSdk?: PaypalCommerceSDK;

    constructor(
        private _store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _cartRequestSender: CartRequestSender,
        private _formPoster: FormPoster,
        private _paypalScriptLoader: PaypalCommerceScriptLoader,
        private _paypalCommerceRequestSender: PaypalCommerceRequestSender
    ) {}

    async initialize(options: CheckoutButtonInitializeOptions): Promise<void> {
        const { paypalcommerce, containerId, methodId } = options;

        if (!methodId) {
            throw new InvalidArgumentError('Unable to initialize payment because "options.methodId" argument is not provided.');
        }

        if (!containerId) {
            throw new InvalidArgumentError(`Unable to initialize payment because "options.containerId" argument is not provided.`);
        }

        if (!paypalcommerce) {
            throw new InvalidArgumentError(`Unable to initialize payment because "options.paypalcommerce" argument is not provided.`);
        }

        if (paypalcommerce.buyNowInitializeOptions) {
            const state = this._store.getState();
            const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);

            if (!paypalcommerce.currencyCode) {
                throw new InvalidArgumentError(`Unable to initialize payment because "options.paypalcommerce.currency" argument is not provided.`);
            }

            this._paypalCommerceSdk = await this._paypalScriptLoader.getPayPalSDK(paymentMethod, paypalcommerce.currencyCode, paypalcommerce.initializesOnCheckoutPage);
        } else {
            const state = await this._store.dispatch(this._checkoutActionCreator.loadDefaultCheckout());
            const currencyCode = state.cart.getCartOrThrow().currency.code;
            const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);
            this._paypalCommerceSdk = await this._paypalScriptLoader.getPayPalSDK(paymentMethod, currencyCode, paypalcommerce.initializesOnCheckoutPage);
        }

        this._renderButton(containerId, methodId, paypalcommerce);
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private _renderButton(containerId: string, methodId: string, paypalcommerce: PaypalCommerceButtonInitializeOptions): void {
        const { buyNowInitializeOptions, initializesOnCheckoutPage, style } = paypalcommerce;
        const paypalCommerceSdk = this._getPayPalCommerceSdkOrThrow();

        const buttonRenderOptions: ButtonsOptions = {
            fundingSource: paypalCommerceSdk.FUNDING.PAYPAL,
            style: style ? this._getButtonStyle(style) : {},
            onClick: () => this._handleClick(buyNowInitializeOptions),
            createOrder: () => this._createOrder(initializesOnCheckoutPage),
            onApprove: ({ orderID }: ApproveDataOptions) => this._tokenizePayment(methodId, orderID),
        };

        const paypalButton = paypalCommerceSdk.Buttons(buttonRenderOptions);

        if (paypalButton.isEligible()) {
            paypalButton.render(`#${containerId}`);
        } else {
            this._removeElement(containerId);
        }
    }

    private async _handleClick(
        buyNowInitializeOptions: PaypalCommerceButtonInitializeOptions['buyNowInitializeOptions'],
    ): Promise<void> {
        if (buyNowInitializeOptions && typeof buyNowInitializeOptions.getBuyNowCartRequestBody === 'function') {
            const cartRequestBody = buyNowInitializeOptions.getBuyNowCartRequestBody();

            if (!cartRequestBody) {
                throw new MissingDataError(MissingDataErrorType.MissingCart);
            }

            try {
                const { body: cart } = await this._cartRequestSender.createBuyNowCart(cartRequestBody);

                this._buyNowCartId = cart.id;
            } catch (error) {
                throw new BuyNowCartCreationError();
            }
        }
    }

    private async _createOrder(initializesOnCheckoutPage?: boolean): Promise<string> {
        const cartId = this._buyNowCartId || this._store.getState().cart.getCartOrThrow().id;

        const providerId = initializesOnCheckoutPage ? 'paypalcommercecheckout': 'paypalcommerce';

        const { orderId } = await this._paypalCommerceRequestSender.createOrder(cartId, providerId);

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
            ...this._buyNowCartId && { cart_id: this._buyNowCartId },
        });
    }

    private _getPayPalCommerceSdkOrThrow(): PaypalCommerceSDK {
        if (!this._paypalCommerceSdk) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this._paypalCommerceSdk;
    }

    private _getButtonStyle(style: PaypalButtonStyleOptions): PaypalButtonStyleOptions {
        const { color, height, label, layout, shape } = getValidButtonStyle(style);

        return { color, height, label, layout, shape };
    }

    private _removeElement(elementId?: string): void {
        const element = elementId && document.getElementById(elementId);

        if (element) {
            element.remove();
        }
    }
}
