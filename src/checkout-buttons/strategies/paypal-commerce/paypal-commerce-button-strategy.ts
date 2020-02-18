import { FormPoster } from '@bigcommerce/form-poster';
import { RequestSender } from '@bigcommerce/request-sender';

import { CheckoutActionCreator, CheckoutStore } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import { INTERNAL_USE_ONLY } from '../../../common/http-request';
import { ApproveDataOptions, PaypalCommerceScriptLoader } from '../../../payment/strategies/paypal-commerce';
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
        const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(options.methodId);
        const paypalOptions = options.paypalCommerce;

        if (!paypalOptions || !paypalOptions.clientId) {
            throw new InvalidArgumentError();
        }

        return this._paypalScriptLoader.loadPaypalCommerce(paypalOptions.clientId)
            .then(paypal => {
                return paypal.Buttons({
                    createOrder: () => this._setupPayment(),
                    onApprove: data => this._tokenizePayment(paymentMethod.id, data),
                }).render(`#${options.containerId}`);
            });
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private _setupPayment(): Promise<string> {

        return this._store.dispatch(this._checkoutActionCreator.loadDefaultCheckout())
            .then(state => {
                const url = '/api/storefront/payment/paypalcommerce';
                const headers = {
                    'X-API-INTERNAL': INTERNAL_USE_ONLY,
                    'Content-Type': 'application/x-www-form-urlencoded',
                };
                const cart = state.cart.getCart();
                const currentCartId = cart ? cart.id : '';

                return this._requestSender.post(url, {
                    headers,
                    body: { cartId: currentCartId },
                });
            })
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
