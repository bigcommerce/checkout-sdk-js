import { FormPoster } from '@bigcommerce/form-poster';

import { CheckoutActionCreator, CheckoutStore } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, } from '../../../common/error/errors';
import { PaymentMethodClientUnavailableError } from '../../../payment/errors';
import { ApproveDataOptions, ButtonsOptions, PaypalButtonStyleOptions, PaypalCommerceRequestSender, PaypalCommerceScriptLoader, PaypalCommerceSDK } from '../../../payment/strategies/paypal-commerce';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonStrategy from '../checkout-button-strategy';

import getValidButtonStyle from './get-valid-button-style';

export default class PaypalCommerceCreditButtonStrategy implements CheckoutButtonStrategy {
    private _paypalCommerceSdk?: PaypalCommerceSDK;

    constructor(
        private _store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _formPoster: FormPoster,
        private _paypalScriptLoader: PaypalCommerceScriptLoader,
        private _paypalCommerceRequestSender: PaypalCommerceRequestSender
    ) {}

    async initialize(options: CheckoutButtonInitializeOptions): Promise<void> {
        const { paypalcommercecredit, containerId, methodId } = options;
        const { initializesOnCheckoutPage, messagingContainerId, style } = paypalcommercecredit || {};

        if (!methodId) {
            throw new InvalidArgumentError('Unable to initialize payment because "options.methodId" argument is not provided.');
        }

        if (!containerId) {
            throw new InvalidArgumentError(`Unable to initialize payment because "options.containerId" argument is not provided.`);
        }

        if (!paypalcommercecredit) {
            throw new InvalidArgumentError(`Unable to initialize payment because "options.paypalcommercecredit" argument is not provided.`);
        }

        const state = await this._store.dispatch(this._checkoutActionCreator.loadDefaultCheckout());
        const currencyCode = state.cart.getCartOrThrow().currency.code;
        const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);
        this._paypalCommerceSdk = await this._paypalScriptLoader.loadPaypalCommerce(paymentMethod, currencyCode, initializesOnCheckoutPage);

        this._renderButton(containerId, methodId, initializesOnCheckoutPage, style);
        this._renderMessages(messagingContainerId);
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private _renderButton(containerId: string, methodId: string, initializesOnCheckoutPage?: boolean, style?: PaypalButtonStyleOptions): void {
        const paypalCommerceSdk = this._getPayPalCommerceSdkOrThrow();
        const fundingSources = [paypalCommerceSdk.FUNDING.PAYLATER, paypalCommerceSdk.FUNDING.CREDIT];

        let hasRenderedSmartButton = false;

        fundingSources.forEach(fundingSource => {
            if (!hasRenderedSmartButton) {
                const buttonRenderOptions: ButtonsOptions = {
                    fundingSource,
                    style: style ? this._getButtonStyle(style) : {},
                    createOrder: () => this._createOrder(initializesOnCheckoutPage),
                    onApprove: ({ orderID }: ApproveDataOptions) => this._tokenizePayment(methodId, orderID),
                };

                const paypalButton = paypalCommerceSdk.Buttons(buttonRenderOptions);

                if (paypalButton.isEligible()) {
                    paypalButton.render(`#${containerId}`);
                    hasRenderedSmartButton = true;
                }
            }
        });

        if (!hasRenderedSmartButton) {
            this._removeElement(containerId);
        }
    }

    private _renderMessages(messagingContainerId?: string): void {
        const state = this._store.getState();
        const cart = state.cart.getCartOrThrow();

        const paypalCommerceSdk = this._getPayPalCommerceSdkOrThrow();

        const isMessagesAvailable = Boolean(messagingContainerId && document.getElementById(messagingContainerId));

        if (isMessagesAvailable) {
            const paypalMessagesOptions = {
                amount: cart.cartAmount,
                placement: 'cart',
                style: {
                    layout: 'text',
                },
            };

            const paypalMessages = paypalCommerceSdk.Messages(paypalMessagesOptions);

            paypalMessages.render(`#${messagingContainerId}`);
        }
    }

    private async _createOrder(initializesOnCheckoutPage?: boolean): Promise<string> {
        const state = this._store.getState();
        const cart = state.cart.getCartOrThrow();

        const providerId = initializesOnCheckoutPage ? 'paypalcommercecreditcheckout': 'paypalcommercecredit';

        const { orderId } = await this._paypalCommerceRequestSender.createOrder(cart.id, providerId);

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
