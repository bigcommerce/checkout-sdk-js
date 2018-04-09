import { CheckoutSelectors } from '../../checkout';
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
        store: any,
        placeOrderService: any,
        private _scriptLoader: any
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

                const { merchantId, testMode } = this._paymentMethod!.config;
                const environment = testMode ? 'sandbox' : 'production';

                this._paypalSdk.checkout.setup(merchantId, {
                    button: 'paypal-button',
                    environment,
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
        const { orderId } = checkout.getOrder()!;

        if (orderId &&
            this._getPaymentStatus() === paymentStatusTypes.ACKNOWLEDGE ||
            this._getPaymentStatus() === paymentStatusTypes.FINALIZE) {
            return this._placeOrderService.finalizeOrder(orderId, options);
        }

        return super.finalize();
    }

    private _getPaymentStatus(): string | undefined {
        const { checkout } = this._store.getState();
        const { payment } = checkout.getOrder()!;

        return payment && payment.status;
    }

    private _isInContextEnabled(): boolean {
        return !!this._paymentMethod!.config.merchantId;
    }
}
