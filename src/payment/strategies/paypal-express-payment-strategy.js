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
        this._paymentMethod = options.paymentMethod;

        if (!this._isInContextEnabled() || this._isInitialized) {
            return super.initialize(options);
        }

        return this._placeOrderService
            .initializePaymentMethod(this._paymentMethod.id, () =>
                this._scriptLoader.loadScript('//www.paypalobjects.com/api/checkout.min.js')
                    .then(() => {
                        this._paypalSdk = window.paypal;

                        const { merchantId, testMode } = this._paymentMethod.config;
                        const environment = testMode ? 'sandbox' : 'production';

                        this._paypalSdk.checkout.setup(merchantId, {
                            button: 'paypal-button',
                            environment,
                        });
                    })
            )
            .then(() => super.initialize(options));
    }

    /**
     * @inheritdoc
     */
    deinitialize() {
        if (!this._isInitialized) {
            return super.deinitialize();
        }

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

                    // We need to hold execution so the consumer does not redirect us somewhere else
                    return new Promise(() => {});
                });
        }

        this._paypalSdk.checkout.initXO();

        return this._placeOrderService.submitOrder(payload, true, options)
            .then((state) => {
                this._paypalSdk.checkout.startFlow(state.checkout.getOrder().payment.redirectUrl);

                // We need to hold execution so the consumer does not redirect us somewhere else
                return new Promise(() => {});
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
        return !!this._paymentMethod.config.merchantId;
    }
}
