import { FormPoster } from '@bigcommerce/form-poster';

import { Cart } from '../../../cart';
import { CheckoutActionCreator, CheckoutStore } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import { ApproveDataOptions, ButtonsOptions, DisableFundingType, PaypalButtonStyleOptions, PaypalCommerceInitializationData, PaypalCommerceRequestSender, PaypalCommerceScriptLoader, PaypalCommerceScriptOptions, StyleButtonColor, StyleButtonLabel, StyleButtonLayout, StyleButtonShape  } from '../../../payment/strategies/paypal-commerce';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonStrategy from '../checkout-button-strategy';

export default class PaypalCommerceButtonStrategy implements CheckoutButtonStrategy {

    constructor(
        private _store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _paypalScriptLoader: PaypalCommerceScriptLoader,
        private _formPoster: FormPoster,
        private _paypalCommerceRequestSender: PaypalCommerceRequestSender
    ) {}

    async initialize(options: CheckoutButtonInitializeOptions): Promise<void> {
        let state = this._store.getState();
        const {
            id: paymentId,
            initializationData,
        } = state.paymentMethods.getPaymentMethodOrThrow(options.methodId);

        if (!initializationData.clientId) {
            throw new InvalidArgumentError();
        }

        state = await this._store.dispatch(this._checkoutActionCreator.loadDefaultCheckout());
        const cart = state.cart.getCartOrThrow();
        const paypalOptions = options.paypalCommerce;

        const buttonParams: ButtonsOptions = {
            createOrder: () => this._setupPayment(cart.id),
            onApprove: data => this._tokenizePayment(paymentId, data),
        };

        if (paypalOptions && paypalOptions.style) {
            buttonParams.style = this._validateStyleParams(paypalOptions.style);
        }

        const paramsScript = this._getParamsScript(initializationData, cart);
        const paypal = await this._paypalScriptLoader.loadPaypalCommerce(paramsScript);

        return paypal.Buttons(buttonParams).render(`#${options.containerId}`);
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private async _setupPayment(cartId: string): Promise<string> {
        const { orderId } = await this._paypalCommerceRequestSender.setupPayment(cartId);

        return orderId;
    }

    private _tokenizePayment(paymentId: string, { orderID }: ApproveDataOptions) {
        if (!orderID) {
            throw new MissingDataError(MissingDataErrorType.MissingPayment);
        }

        return this._formPoster.postForm('/checkout.php', {
            payment_type: 'paypal',
            action: 'set_external_checkout',
            provider: paymentId,
            order_id: orderID,
        });
    }

    private _validateStyleParams(style: PaypalButtonStyleOptions): PaypalButtonStyleOptions {
        const updatedStyle: PaypalButtonStyleOptions = { ...style };
        const { label, color, layout, shape, height, tagline } = style;

        if (label && !StyleButtonLabel[label]) {
            delete updatedStyle.label;
        }

        if (layout && !StyleButtonLayout[layout]) {
            delete updatedStyle.layout;
        }

        if (color && !StyleButtonColor[color]) {
            delete updatedStyle.color;
        }

        if (shape && !StyleButtonShape[shape]) {
            delete updatedStyle.shape;
        }

        if (typeof height === 'number') {
            updatedStyle.height = height < 25
                ? 25
                : (height > 55 ? 55 : height);
        } else {
            delete updatedStyle.height;
        }

        if (typeof tagline !== 'boolean' || (tagline && updatedStyle.layout !== StyleButtonLayout[StyleButtonLayout.horizontal])) {
            delete updatedStyle.tagline;
        }

        return updatedStyle;
    }

    private _getParamsScript(initializationData: PaypalCommerceInitializationData, cart: Cart): PaypalCommerceScriptOptions {
        const { clientId, intent, isPayPalCreditAvailable } = initializationData;
        const disableFunding: DisableFundingType = [ 'card' ];

        if (!isPayPalCreditAvailable) {
            disableFunding.push('credit');
        }

        return {
            clientId,
            commit: false,
            currency: cart.currency.code,
            disableFunding,
            intent,
        };
    }
}
