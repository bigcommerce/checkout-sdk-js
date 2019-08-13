import { FormPoster } from '@bigcommerce/form-poster';
import { pick } from 'lodash';

import { CheckoutActionCreator, CheckoutStore } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType, StandardError } from '../../../common/error/errors';
import { INTERNAL_USE_ONLY } from '../../../common/http-request';
import { PaymentMethod } from '../../../payment';
import { PaypalActions, PaypalAuthorizeData, PaypalClientToken, PaypalScriptLoader } from '../../../payment/strategies/paypal';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonStrategy from '../checkout-button-strategy';

export default class PaypalButtonStrategy implements CheckoutButtonStrategy {
    private _paymentMethod?: PaymentMethod;

    constructor(
        private _store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _paypalScriptLoader: PaypalScriptLoader,
        private _formPoster: FormPoster,
        private _host: string = ''
    ) {}

    initialize(options: CheckoutButtonInitializeOptions): Promise<void> {
        const paypalOptions = options.paypal;
        const state = this._store.getState();
        const paymentMethod = this._paymentMethod = state.paymentMethods.getPaymentMethod(options.methodId);

        if (!paypalOptions) {
            throw new InvalidArgumentError();
        }

        return this._paypalScriptLoader.loadPaypal()
            .then(paypal => {
                if (!paymentMethod || !paymentMethod.config.merchantId) {
                    throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                }

                const merchantId = paymentMethod.config.merchantId;
                const env = paymentMethod.config.testMode ? 'sandbox' : 'production';
                const clientToken: PaypalClientToken = { [env]: paypalOptions.clientId };

                const allowedSources = [];
                const disallowedSources = [];

                if (paypalOptions.allowCredit) {
                    allowedSources.push(paypal.FUNDING.CREDIT);
                } else {
                    disallowedSources.push(paypal.FUNDING.CREDIT);
                }

                return paypal.Button.render({
                    env,
                    client: clientToken,
                    commit: paypalOptions.shouldProcessPayment,
                    funding: {
                        allowed: allowedSources,
                        disallowed: disallowedSources,
                    },
                    style: {
                        shape: 'rect',
                        ...pick(paypalOptions.style, 'layout', 'size', 'color', 'label', 'shape', 'tagline', 'fundingicons'),
                    },
                    payment: (_, actions) => this._setupPayment(merchantId, actions, paypalOptions.onPaymentError),
                    onAuthorize: (data, actions) => this._tokenizePayment(data, actions, paypalOptions.shouldProcessPayment, paypalOptions.onAuthorizeError),
                }, options.containerId);
            });
    }

    deinitialize(): Promise<void> {
        this._paymentMethod = undefined;

        return Promise.resolve();
    }

    private _setupPayment(merchantId: string, actions?: PaypalActions, onError?: (error: StandardError) => void): Promise<string> {
        if (!actions) {
            throw new NotInitializedError(NotInitializedErrorType.CheckoutButtonNotInitialized);
        }

        return this._store.dispatch(this._checkoutActionCreator.loadDefaultCheckout())
            .then(state => {
                const cart = state.cart.getCart();
                const cartId = cart ? cart.id : '';

                return actions.request.post(`${this._host}/api/storefront/payment/paypalexpress`, { merchantId, cartId }, {
                    headers: {
                        'X-API-INTERNAL': INTERNAL_USE_ONLY,
                    },
                });
            })
            .then(res => res.id)
            .catch(error => {
                if (onError) {
                    onError(error);
                }

                throw error;
            });
    }

    private _tokenizePayment(
        data: PaypalAuthorizeData,
        actions?: PaypalActions,
        shouldProcessPayment?: boolean,
        _onError?: (error: StandardError) => void // FIXME: This parameter seems to be unused
    ): Promise<void> {
        if (!this._paymentMethod) {
            throw new NotInitializedError(NotInitializedErrorType.CheckoutButtonNotInitialized);
        }

        if (!actions) {
            throw new NotInitializedError(NotInitializedErrorType.CheckoutButtonNotInitialized);
        }

        if (!data.paymentID || !data.payerID) {
            throw new MissingDataError(MissingDataErrorType.MissingPayment);
        }

        const methodId = this._paymentMethod.id;

        return actions.payment.get(data.paymentID).then(payload => {
            this._formPoster.postForm('/checkout.php', {
                payment_type: 'paypal',
                provider: methodId,
                action: shouldProcessPayment ? 'process_payment' : 'set_external_checkout',
                paymentId: data.paymentID,
                payerId: data.payerID,
                payerInfo: JSON.stringify(payload.payer.payer_info),
            });
        });
    }
}
