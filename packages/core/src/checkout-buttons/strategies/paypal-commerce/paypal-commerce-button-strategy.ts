import { FormPoster } from '@bigcommerce/form-poster';

import { CartActionCreator } from '../../../cart';
import { CheckoutActionCreator, CheckoutStore } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, } from '../../../common/error/errors';
import { PaymentMethodClientUnavailableError } from '../../../payment/errors';
import { ApproveDataOptions, ButtonsOptions, PaypalButtonStyleOptions, PaypalCommerceRequestSender, PaypalCommerceScriptLoader, PaypalCommerceSDK } from '../../../payment/strategies/paypal-commerce';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonStrategy from '../checkout-button-strategy';

import getValidButtonStyle from './get-valid-button-style';
import { PaypalCommerceButtonInitializeOptions } from './paypal-commerce-button-options';

export default class PaypalCommerceButtonStrategy implements CheckoutButtonStrategy {
    private _paypalCommerceSdk?: PaypalCommerceSDK;

    constructor(
        private _store: CheckoutStore,
        private _cartActionCreator: CartActionCreator,
        private _checkoutActionCreator: CheckoutActionCreator,
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

        const { buyNowInitialiseOptions, initializesOnCheckoutPage } = paypalcommerce;

        // Info: it's a temporary decision until we have v1 and v2 version methodIds.
        // TODO: should be removed when PAYPAL-1539 hits Tier3
        const updatedMethodId = methodId === 'paypalcommercev2' ? 'paypalcommerce' : methodId;

        const state = await this._store.dispatch(this._checkoutActionCreator.loadDefaultCheckout());
        const currencyCode = buyNowInitialiseOptions?.currencyCode || state.cart.getCartOrThrow().currency.code;

        // TODO: should be updated when PAYPAL-1539 hits Tier3
        const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(updatedMethodId);
        this._paypalCommerceSdk = await this._paypalScriptLoader.getPayPalSDK(paymentMethod, currencyCode, initializesOnCheckoutPage);

        // TODO: should be updated when PAYPAL-1539 hits Tier3
        this._renderButton(containerId, updatedMethodId, paypalcommerce);
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private _renderButton(containerId: string, methodId: string, paypalcommerce: PaypalCommerceButtonInitializeOptions): void {
        const { buyNowInitialiseOptions, initializesOnCheckoutPage, style } = paypalcommerce;
        const paypalCommerceSdk = this._getPayPalCommerceSdkOrThrow();

        const buttonRenderOptions: ButtonsOptions = {
            fundingSource: paypalCommerceSdk.FUNDING.PAYPAL,
            style: style ? this._getButtonStyle(style) : {},
            createOrder: () => this._createOrder(initializesOnCheckoutPage),
            onApprove: ({ orderID }: ApproveDataOptions) => this._tokenizePayment(methodId, orderID),
            onClick: () => this._handleClick(buyNowInitialiseOptions),
        };

        const paypalButton = paypalCommerceSdk.Buttons(buttonRenderOptions);

        if (paypalButton.isEligible()) {
            paypalButton.render(`#${containerId}`);
        } else {
            this._removeElement(containerId);
        }
    }

    private async _createOrder(initializesOnCheckoutPage?: boolean): Promise<string> {
        const cartId = this._store.getState().cart.getCartOrThrow().id;

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
        });
    }

    private async _handleClick(buyNowInitialiseOptions: PaypalCommerceButtonInitializeOptions['buyNowInitialiseOptions']): Promise<void> {
        if (buyNowInitialiseOptions && typeof buyNowInitialiseOptions.getCartRequestBody === 'function') {
            const cartRequestBody = buyNowInitialiseOptions.getCartRequestBody();

            if (!cartRequestBody) {
                throw new MissingDataError(MissingDataErrorType.MissingCart);
            }

            await this._store.dispatch(this._cartActionCreator.createCart(cartRequestBody));
        }
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
