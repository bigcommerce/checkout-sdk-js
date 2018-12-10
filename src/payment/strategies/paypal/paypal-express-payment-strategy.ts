import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import PaymentMethod from '../../payment-method';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import * as paymentStatusTypes from '../../payment-status-types';
import PaymentStrategy from '../payment-strategy';

import PaypalScriptLoader from './paypal-script-loader';
import { PaypalHostWindow, PaypalSDK } from './paypal-sdk';

export default class PaypalExpressPaymentStrategy implements PaymentStrategy {
    private _paypalSdk?: PaypalSDK;
    private _paymentMethod?: PaymentMethod;
    private _useRedirectFlow: boolean = false;

    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _scriptLoader: PaypalScriptLoader,
        private _window: PaypalHostWindow = window
    ) {}

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const state = this._store.getState();

        this._paymentMethod = state.paymentMethods.getPaymentMethod(options.methodId);
        this._useRedirectFlow = (options.paypalexpress && options.paypalexpress.useRedirectFlow) === true;

        if (!this._isInContextEnabled()) {
            return Promise.resolve(this._store.getState());
        }

        return this._scriptLoader.loadPaypal()
            .then(paypal => {
                this._paypalSdk = paypal;

                if (!this._paymentMethod || !this._paymentMethod.config.merchantId) {
                    throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                }

                this._paypalSdk.checkout.setup(this._paymentMethod.config.merchantId, {
                    button: 'paypal-button',
                    environment: this._paymentMethod.config.testMode ? 'sandbox' : 'production',
                });
            })
            .then(() => this._store.getState());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        if (this._isInContextEnabled() && this._paypalSdk) {
            this._paypalSdk.checkout.closeFlow();
            this._paypalSdk = undefined;
        }

        return Promise.resolve(this._store.getState());
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const paypal = this._paypalSdk;

        if (this._isAcknowledgedOrFinalized()) {
            return this._store.dispatch(this._orderActionCreator.submitOrder(payload, options));
        }

        if (!this._isInContextEnabled() || this._useRedirectFlow) {
            return this._store.dispatch(this._orderActionCreator.submitOrder(payload, options))
                .then(state => {
                    const redirectUrl = state.payment.getPaymentRedirectUrl();

                    if (redirectUrl) {
                        this._window.top.location.href = redirectUrl;
                    }

                    // We need to hold execution so the consumer does not redirect us somewhere else
                    return new Promise<never>(() => {});
                });
        }

        if (!paypal) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        paypal.checkout.initXO();

        return this._store.dispatch(this._orderActionCreator.submitOrder(payload, options))
            .then(state => {
                const redirectUrl = state.payment.getPaymentRedirectUrl();

                if (redirectUrl) {
                    paypal.checkout.startFlow(redirectUrl);
                }

                // We need to hold execution so the consumer does not redirect us somewhere else
                return new Promise<never>(() => {});
            })
            .catch(error => {
                paypal.checkout.closeFlow();

                return Promise.reject(error);
            });
    }

    finalize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const state = this._store.getState();
        const order = state.order.getOrder();

        if (order && this._isAcknowledgedOrFinalized()) {
            return this._store.dispatch(this._orderActionCreator.finalizeOrder(order.orderId, options));
        }

        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    private _isAcknowledgedOrFinalized(): boolean {
        const state = this._store.getState();

        return state.payment.getPaymentStatus() === paymentStatusTypes.ACKNOWLEDGE
            || state.payment.getPaymentStatus() === paymentStatusTypes.FINALIZE;
    }

    private _isInContextEnabled(): boolean {
        return !!(this._paymentMethod && this._paymentMethod.config.merchantId);
    }
}
