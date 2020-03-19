import { FormPoster } from '@bigcommerce/form-poster';
import { RequestSender } from '@bigcommerce/request-sender';

import { Cart } from '../../../cart';
import { CheckoutActionCreator, CheckoutStore } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import { ContentType, INTERNAL_USE_ONLY } from '../../../common/http-request';
import { ApproveDataOptions, ButtonsOptions, PaypalButtonStyleOptions, PaypalCommerceScriptLoader, PaypalCommerceScriptOptions, StyleButtonColor, StyleButtonLabel, StyleButtonLayout, StyleButtonShape  } from '../../../payment/strategies/paypal-commerce';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonStrategy from '../checkout-button-strategy';

export default class PaypalCommerceButtonStrategy implements CheckoutButtonStrategy {

    constructor(
        private _store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _paypalScriptLoader: PaypalCommerceScriptLoader,
        private _formPoster: FormPoster,
        private _requestSender: RequestSender
    ) {}

    initialize(options: CheckoutButtonInitializeOptions): Promise<void> {
        const state = this._store.getState();
        const {
            id: paymentId,
            initializationData: { clientId, intent, isPayPalCreditAvailable },
        } = state.paymentMethods.getPaymentMethodOrThrow(options.methodId);
        const paypalOptions = options.paypalCommerce;

        if (!clientId) {
            throw new InvalidArgumentError();
        }

        return this._store.dispatch(this._checkoutActionCreator.loadDefaultCheckout())
            .then(state => {
                const cart = state.cart.getCart();

                if (!cart) {
                    throw new MissingDataError(MissingDataErrorType.MissingCart);
                }

                const buttonParams: ButtonsOptions = {
                    createOrder: () => this._setupPayment(cart),
                    onApprove: data => this._tokenizePayment(paymentId, data),
                };

                if (paypalOptions && paypalOptions.style) {
                    buttonParams.style = this._validateStyleParams(paypalOptions.style);
                }

                const paramsScript: PaypalCommerceScriptOptions = {
                    clientId,
                    intent,
                    currency: cart.currency.code,
                    commit: false,
                };

                if (!isPayPalCreditAvailable) {
                    paramsScript.disableFunding = 'credit';
                }

                return this._paypalScriptLoader.loadPaypalCommerce(paramsScript)
                    .then(paypal => paypal.Buttons(buttonParams).render(`#${options.containerId}`));
            });
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
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

    private _setupPayment(cart: Cart): Promise<string> {
        const cartId = cart.id;
        const url = '/api/storefront/payment/paypalcommerce';
        const body = { cartId };
        const headers = {
            'X-API-INTERNAL': INTERNAL_USE_ONLY,
            'Content-Type': ContentType.Json,
        };

        return this._requestSender.post(url, { headers, body })
            .then(res => res.body.orderId);
    }

    private _tokenizePayment(paymentId: string, data: ApproveDataOptions) {
        if (!data.orderID) {
            throw new MissingDataError(MissingDataErrorType.MissingPayment);
        }

        return this._formPoster.postForm('/checkout.php', {
            payment_type: 'paypal',
            action: 'set_external_checkout',
            provider: paymentId,
            order_id: data.orderID,
        });
    }
}
