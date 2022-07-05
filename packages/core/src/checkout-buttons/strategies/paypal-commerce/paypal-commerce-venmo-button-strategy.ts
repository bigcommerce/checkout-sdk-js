import { FormPoster } from '@bigcommerce/form-poster';

import { CheckoutActionCreator, CheckoutStore } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, } from '../../../common/error/errors';
import { PaymentMethod } from '../../../payment';
import { PaymentMethodClientUnavailableError } from '../../../payment/errors';
import { ApproveDataOptions, ButtonsOptions, PaypalButtonStyleOptions, PaypalCommerceRequestSender, PaypalCommerceScriptLoader, PaypalCommerceScriptParams, PaypalCommerceSDK } from '../../../payment/strategies/paypal-commerce';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonStrategy from '../checkout-button-strategy';

import getValidButtonStyle from './get-valid-button-style';

export default class PaypalCommerceVenmoButtonStrategy implements CheckoutButtonStrategy {
    private _paypalCommerceSdk?: PaypalCommerceSDK;
    private _paymentMethod?: PaymentMethod;

    constructor(
        private _store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _formPoster: FormPoster,
        private _paypalScriptLoader: PaypalCommerceScriptLoader,
        private _paypalCommerceRequestSender: PaypalCommerceRequestSender
    ) {}

    async initialize(options: CheckoutButtonInitializeOptions): Promise<void> {
        const { paypalcommercevenmo, containerId, methodId } = options;
        const { style, initializesOnCheckoutPage } = paypalcommercevenmo || {};

        if (!methodId) {
            throw new InvalidArgumentError('Unable to initialize payment because "options.methodId" argument is not provided.');
        }

        if (!containerId) {
            throw new InvalidArgumentError(`Unable to initialize payment because "options.containerId" argument is not provided.`);
        }

        if (!paypalcommercevenmo) {
            throw new InvalidArgumentError(`Unable to initialize payment because "options.paypalcommercevenmo" argument is not provided.`);
        }

        const state = await this._store.dispatch(this._checkoutActionCreator.loadDefaultCheckout());
        this._paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);

        if (!this._paymentMethod.initializationData.clientId) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const paypalSdkScriptParams = this._getScriptParams(initializesOnCheckoutPage);
        this._paypalCommerceSdk = await this._paypalScriptLoader.loadPaypalCommerce(paypalSdkScriptParams);

        this._renderButton(containerId, initializesOnCheckoutPage, style);
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private _getScriptParams(initializesOnCheckoutPage?: boolean): PaypalCommerceScriptParams {
        const state = this._store.getState();
        const currency = state.cart.getCartOrThrow().currency.code;

        const { initializationData } = this._getPaymentMethodOrThrow();
        const { attributionId, clientId, intent, merchantId } = initializationData;

        return {
            'client-id': clientId,
            'data-partner-attribution-id': attributionId,
            'merchant-id': merchantId,
            commit: !!initializesOnCheckoutPage,
            components: ['buttons', 'messages'],
            'enable-funding': ['venmo'],
            currency,
            intent,
        };
    }

    private _renderButton(containerId: string, initializesOnCheckoutPage?: boolean, style?: PaypalButtonStyleOptions): void {
        const paypalCommerceSdk = this._getPayPalCommerceSdkOrThrow();
        const fundingSource = paypalCommerceSdk.FUNDING.VENMO;

        const validButtonStyle = style ? this._getVenmoButtonStyle(style) : {};

        const buttonRenderOptions: ButtonsOptions = {
            fundingSource,
            style: validButtonStyle,
            createOrder: () => this._createOrder(initializesOnCheckoutPage),
            onApprove: ({ orderID }: ApproveDataOptions) => this._tokenizePayment(orderID),
        };

        const paypalButtonRender = paypalCommerceSdk.Buttons(buttonRenderOptions);

        if (paypalButtonRender.isEligible()) {
            paypalButtonRender.render(`#${containerId}`);
        } else {
            this._removeElement(containerId);
        }
    }

    private async _createOrder(initializesOnCheckoutPage?: boolean): Promise<string> {
        const state = this._store.getState();
        const cart = state.cart.getCartOrThrow();

        const providerId = initializesOnCheckoutPage ? 'paypalcommercevenmocheckout': 'paypalcommercevenmo';


        const { orderId } = await this._paypalCommerceRequestSender.createOrder(cart.id, providerId);

        return orderId;
    }

    private _tokenizePayment(orderId?: string): void {
        const paymentMethod = this._getPaymentMethodOrThrow();

        if (!orderId) {
            throw new MissingDataError(MissingDataErrorType.MissingOrderId);
        }

        return this._formPoster.postForm('/checkout.php', {
            payment_type: 'paypal',
            action: 'set_external_checkout',
            provider: paymentMethod.id,
            order_id: orderId,
        });
    }

    private _getPayPalCommerceSdkOrThrow(): PaypalCommerceSDK {
        if (!this._paypalCommerceSdk) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this._paypalCommerceSdk;
    }

    private _getPaymentMethodOrThrow(): PaymentMethod {
        if (!this._paymentMethod) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        return this._paymentMethod;
    }

    private _getVenmoButtonStyle(style: PaypalButtonStyleOptions): PaypalButtonStyleOptions {
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
