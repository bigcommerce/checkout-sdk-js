import { ScriptLoader } from '@bigcommerce/script-loader';

import { CheckoutSelectors, CheckoutStore } from '../../checkout';
import { MissingDataError } from '../../common/error/errors';
import { PlaceOrderService } from '../../order';
import * as paymentStatusTypes from '../payment-status-types';

import PaymentStrategy from './payment-strategy';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class PaypalExpressPaymentStrategy extends PaymentStrategy {
    private _paypalSdk: any;

    /**
     * @constructor
     * @param {CheckoutStore} store
     * @param {PlaceOrderService} placeOrderService
     * @param {ScriptLoader} scriptLoader
     */
    constructor(
        store: CheckoutStore,
        placeOrderService: PlaceOrderService,
        private _scriptLoader: ScriptLoader
    ) {
        super(store, placeOrderService);
    }

    initialize(options?: any): Promise<CheckoutSelectors> {
        this._paymentMethod = options.paymentMethod;

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

    deinitialize(): Promise<CheckoutSelectors> {
        if (!this._isInitialized) {
            return super.deinitialize();
        }

        if (this._isInContextEnabled() && this._paypalSdk) {
            this._paypalSdk.checkout.closeFlow();
            this._paypalSdk = null;
        }

        return super.deinitialize();
    }

    execute(payload: any, options: any): Promise<CheckoutSelectors> {
        if (this._getPaymentStatus() === paymentStatusTypes.ACKNOWLEDGE ||
            this._getPaymentStatus() === paymentStatusTypes.FINALIZE) {
            return this._placeOrderService.submitOrder(payload, true);
        }

        if (!this._isInContextEnabled()) {
            return this._placeOrderService.submitOrder(payload, true, options)
                .then((state: any) => {
                    window.location.assign(state.checkout.getOrder().payment.redirectUrl);

                    // We need to hold execution so the consumer does not redirect us somewhere else
                    return new Promise(() => {});
                });
        }

        this._paypalSdk.checkout.initXO();

        return this._placeOrderService.submitOrder(payload, true, options)
            .then((state: any) => {
                this._paypalSdk.checkout.startFlow(state.checkout.getOrder().payment.redirectUrl);

                // We need to hold execution so the consumer does not redirect us somewhere else
                return new Promise(() => {});
            })
            .catch((state: any) => {
                this._paypalSdk.checkout.closeFlow();

                return Promise.reject(state);
            });
    }

    finalize(options: any): Promise<CheckoutSelectors> {
        const { checkout } = this._store.getState();
        const order = checkout.getOrder();

        if (!order) {
            throw new MissingDataError('Unable to finalize order because "order" data is missing.');
        }

        if (order.orderId &&
            this._getPaymentStatus() === paymentStatusTypes.ACKNOWLEDGE ||
            this._getPaymentStatus() === paymentStatusTypes.FINALIZE) {
            return this._placeOrderService.finalizeOrder(order.orderId, options);
        }

        return super.finalize();
    }

    private _getPaymentStatus(): string | undefined {
        const { checkout } = this._store.getState();
        const order = checkout.getOrder();

        if (!order) {
            throw new MissingDataError('Unable to determine payment status because "order" data is missing.');
        }

        return order.payment && order.payment.status;
    }

    private _isInContextEnabled(): boolean {
        return !!(this._paymentMethod && this._paymentMethod.config.merchantId);
    }
}
