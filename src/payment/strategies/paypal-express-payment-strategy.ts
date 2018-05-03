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

        this._paymentMethod = state.paymentMethod.getPaymentMethod(options.methodId);

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
        if (this._getPaymentStatus() === paymentStatusTypes.ACKNOWLEDGE ||
            this._getPaymentStatus() === paymentStatusTypes.FINALIZE) {
            return this._store.dispatch(this._orderActionCreator.submitOrder(payload, true, options));
        }

        if (!this._isInContextEnabled()) {
            return this._store.dispatch(this._orderActionCreator.submitOrder(payload, true, options))
                .then(state => {
                    const order = state.order.getOrder();

                    if (order && order.payment.redirectUrl) {
                        window.location.assign(order.payment.redirectUrl);
                    }

                    // We need to hold execution so the consumer does not redirect us somewhere else
                    return new Promise<never>(() => {});
                });
        }

        this._paypalSdk.checkout.initXO();

        return this._store.dispatch(this._orderActionCreator.submitOrder(payload, true, options))
            .then(state => {
                const order = state.order.getOrder();

                if (order && order.payment.redirectUrl) {
                    this._paypalSdk.checkout.startFlow(order.payment.redirectUrl);
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

        if (!order) {
            throw new MissingDataError('Unable to finalize order because "order" data is missing.');
        }

        if (order.orderId &&
            this._getPaymentStatus() === paymentStatusTypes.ACKNOWLEDGE ||
            this._getPaymentStatus() === paymentStatusTypes.FINALIZE) {
            return this._store.dispatch(this._orderActionCreator.finalizeOrder(order.orderId, options));
        }

        return super.finalize();
    }

    private _getPaymentStatus(): string | undefined {
        const state = this._store.getState();
        const order = state.order.getOrder();

        if (!order) {
            throw new MissingDataError('Unable to determine payment status because "order" data is missing.');
        }

        return order.payment && order.payment.status;
    }

    private _isInContextEnabled(): boolean {
        return !!(this._paymentMethod && this._paymentMethod.config.merchantId);
    }
}
