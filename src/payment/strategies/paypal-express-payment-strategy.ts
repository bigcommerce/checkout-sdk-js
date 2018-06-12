import { ScriptLoader } from '@bigcommerce/script-loader';

import { CheckoutStore, InternalCheckoutSelectors } from '../../checkout';
import { MissingDataError } from '../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../order';
import PaymentMethod from '../payment-method';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../payment-request-options';
import * as paymentStatusTypes from '../payment-status-types';

import PaymentStrategy from './payment-strategy';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class PaypalExpressPaymentStrategy extends PaymentStrategy {
    private _paypalSdk: any;
    private _paymentMethod?: PaymentMethod;

    constructor(
        store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _scriptLoader: ScriptLoader
    ) {
        super(store);
    }

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const state = this._store.getState();

        this._paymentMethod = state.paymentMethods.getPaymentMethod(options.methodId);

        if (!this._isInContextEnabled() || this._isInitialized) {
            return super.initialize(options);
        }

        return this._scriptLoader.loadScript('//www.paypalobjects.com/api/checkout.min.js')
            .then(() => {
                this._paypalSdk = (window as any).paypal;

                if (!this._paymentMethod || !this._paymentMethod.config.merchantId) {
                    throw new MissingDataError('Unable to initialize because "paymentMethod.config.merchantId" field is missing.');
                }

                this._paypalSdk.checkout.setup(this._paymentMethod.config.merchantId, {
                    button: 'paypal-button',
                    environment: this._paymentMethod.config.testMode ? 'sandbox' : 'production',
                });
            })
            .then(() => super.initialize(options));
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        if (!this._isInitialized) {
            return super.deinitialize();
        }

        if (this._isInContextEnabled() && this._paypalSdk) {
            this._paypalSdk.checkout.closeFlow();
            this._paypalSdk = null;
        }

        return super.deinitialize();
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        if (this._isAcknowledgedOrFinalized()) {
            return this._store.dispatch(this._orderActionCreator.submitOrder(payload, options));
        }

        if (!this._isInContextEnabled()) {
            return this._store.dispatch(this._orderActionCreator.submitOrder(payload, options))
                .then(state => {
                    const redirectUrl = state.payment.getPaymentRedirectUrl();

                    if (redirectUrl) {
                        window.location.assign(redirectUrl);
                    }

                    // We need to hold execution so the consumer does not redirect us somewhere else
                    return new Promise<never>(() => {});
                });
        }

        this._paypalSdk.checkout.initXO();

        return this._store.dispatch(this._orderActionCreator.submitOrder(payload, options))
            .then(state => {
                const redirectUrl = state.payment.getPaymentRedirectUrl();

                if (redirectUrl) {
                    this._paypalSdk.checkout.startFlow(redirectUrl);
                }

                // We need to hold execution so the consumer does not redirect us somewhere else
                return new Promise<never>(() => {});
            })
            .catch(error => {
                this._paypalSdk.checkout.closeFlow();

                return Promise.reject(error);
            });
    }

    finalize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const state = this._store.getState();
        const order = state.order.getOrder();

        if (order && this._isAcknowledgedOrFinalized()) {
            return this._store.dispatch(this._orderActionCreator.finalizeOrder(order.orderId, options));
        }

        return super.finalize();
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
