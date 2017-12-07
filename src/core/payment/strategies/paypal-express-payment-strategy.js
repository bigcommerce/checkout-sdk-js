import PaymentStrategy from './payment-strategy';
import * as paymentStatusTypes from '../payment-status-types';

export default class PaypalExpressPaymentStrategy extends PaymentStrategy {
    /**
     * @constructor
     * @param {ReadableDataStore} store
     * @param {PlaceOrderService} placeOrderService
     * @param {ScriptLoader} scriptLoader
     */
    constructor(store, placeOrderService, scriptLoader) {
        super(store, placeOrderService);

        this._scriptLoader = scriptLoader;
        this._paypalSdk = null;
    }

    /**
     * @inheritdoc
     */
    initialize(options) {
        if (!this._isInContextEnabled()) {
            return super.initialize(options);
        }

        return this._scriptLoader.loadScript('//www.paypalobjects.com/api/checkout.min.js')
            .then(() => {
                this._paypalSdk = window.paypal;

                const { checkout } = this._store.getState();
                const { merchantId, testMode } = checkout.getPaymentMethod('paypalexpress').config;
                const environment = testMode ? 'sandbox' : 'production';

                this._paypalSdk.checkout.setup(merchantId, {
                    button: 'paypal-button',
                    environment,
                });

                return super.initialize(options);
            });
    }

    /**
     * @inheritdoc
     */
    deinitialize() {
        if (this._isInContextEnabled() && this._paypalSdk) {
            this._paypalSdk.checkout.closeFlow();
            this._paypalSdk = null;
        }

        return super.deinitialize();
    }

    /**
     * @inheritdoc
     */
    execute(payload, options) {
        if (this._getPaymentStatus() === paymentStatusTypes.ACKNOWLEDGE ||
            this._getPaymentStatus() === paymentStatusTypes.FINALIZE) {
            return this._placeOrderService.submitOrder(payload, true);
        }

        if (!this._isInContextEnabled()) {
            return this._placeOrderService.submitOrder(payload, true, options)
                .then((state) => {
                    window.location.assign(state.checkout.getOrder().payment.redirectUrl);

                    return this._resolveBeforeUnload(state);
                });
        }

        if (!this._paypalSdk) {
            throw new Error('Unable to submit payment as payment method is not initialized');
        }

        this._paypalSdk.checkout.initXO();

        return this._placeOrderService.submitOrder(payload, true, options)
            .then((state) => {
                this._paypalSdk.checkout.startFlow(state.checkout.getOrder().payment.redirectUrl);

                return this._resolveBeforeUnload(state);
            })
            .catch((state) => {
                this._paypalSdk.checkout.closeFlow();

                return Promise.reject(state);
            });
    }

    /**
     * @inheritdoc
     */
    finalize(options) {
        const { checkout } = this._store.getState();
        const { orderId } = checkout.getOrder();

        if (orderId &&
            this._getPaymentStatus() === paymentStatusTypes.ACKNOWLEDGE ||
            this._getPaymentStatus() === paymentStatusTypes.FINALIZE) {
            return this._placeOrderService.finalizeOrder(orderId, options);
        }

        return super.finalize();
    }

    /**
     * @private
     * @return {?string}
     */
    _getPaymentStatus() {
        const { checkout } = this._store.getState();
        const { payment } = checkout.getOrder();

        return payment && payment.status;
    }

    /**
     * @private
     * @return {boolean}
     */
    _isInContextEnabled() {
        const { checkout } = this._store.getState();
        const { merchantId } = checkout.getPaymentMethod('paypalexpress').config;

        return !!merchantId;
    }

    /**
     * @private
     * @param {CheckoutSelectors} state
     * @return {Promise<CheckoutSelectors>}
     */
    _resolveBeforeUnload(state) {
        return new Promise((resolve) => {
            const handleUnload = () => {
                window.removeEventListener('unload', handleUnload);

                resolve(state);
            };

            window.addEventListener('unload', handleUnload);
        });
    }
}
