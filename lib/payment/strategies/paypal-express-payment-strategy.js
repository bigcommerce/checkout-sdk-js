"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var payment_strategy_1 = require("./payment-strategy");
var paymentStatusTypes = require("../payment-status-types");
var PaypalExpressPaymentStrategy = (function (_super) {
    tslib_1.__extends(PaypalExpressPaymentStrategy, _super);
    function PaypalExpressPaymentStrategy(store, placeOrderService, scriptLoader) {
        var _this = _super.call(this, store, placeOrderService) || this;
        _this._scriptLoader = scriptLoader;
        _this._paypalSdk = null;
        return _this;
    }
    PaypalExpressPaymentStrategy.prototype.initialize = function (options) {
        var _this = this;
        this._paymentMethod = options.paymentMethod;
        if (!this._isInContextEnabled() || this._isInitialized) {
            return _super.prototype.initialize.call(this, options);
        }
        return this._placeOrderService
            .initializePaymentMethod(this._paymentMethod.id, function () {
            return _this._scriptLoader.loadScript('//www.paypalobjects.com/api/checkout.min.js')
                .then(function () {
                _this._paypalSdk = window.paypal;
                var _a = _this._paymentMethod.config, merchantId = _a.merchantId, testMode = _a.testMode;
                var environment = testMode ? 'sandbox' : 'production';
                _this._paypalSdk.checkout.setup(merchantId, {
                    button: 'paypal-button',
                    environment: environment,
                });
            });
        })
            .then(function () { return _super.prototype.initialize.call(_this, options); });
    };
    PaypalExpressPaymentStrategy.prototype.deinitialize = function () {
        if (!this._isInitialized) {
            return _super.prototype.deinitialize.call(this);
        }
        if (this._isInContextEnabled() && this._paypalSdk) {
            this._paypalSdk.checkout.closeFlow();
            this._paypalSdk = null;
        }
        return _super.prototype.deinitialize.call(this);
    };
    PaypalExpressPaymentStrategy.prototype.execute = function (payload, options) {
        var _this = this;
        if (this._getPaymentStatus() === paymentStatusTypes.ACKNOWLEDGE ||
            this._getPaymentStatus() === paymentStatusTypes.FINALIZE) {
            return this._placeOrderService.submitOrder(payload, true);
        }
        if (!this._isInContextEnabled()) {
            return this._placeOrderService.submitOrder(payload, true, options)
                .then(function (state) {
                window.location.assign(state.checkout.getOrder().payment.redirectUrl);
                return new Promise(function () { });
            });
        }
        this._paypalSdk.checkout.initXO();
        return this._placeOrderService.submitOrder(payload, true, options)
            .then(function (state) {
            _this._paypalSdk.checkout.startFlow(state.checkout.getOrder().payment.redirectUrl);
            return new Promise(function () { });
        })
            .catch(function (state) {
            _this._paypalSdk.checkout.closeFlow();
            return Promise.reject(state);
        });
    };
    PaypalExpressPaymentStrategy.prototype.finalize = function (options) {
        var checkout = this._store.getState().checkout;
        var orderId = checkout.getOrder().orderId;
        if (orderId &&
            this._getPaymentStatus() === paymentStatusTypes.ACKNOWLEDGE ||
            this._getPaymentStatus() === paymentStatusTypes.FINALIZE) {
            return this._placeOrderService.finalizeOrder(orderId, options);
        }
        return _super.prototype.finalize.call(this);
    };
    PaypalExpressPaymentStrategy.prototype._getPaymentStatus = function () {
        var checkout = this._store.getState().checkout;
        var payment = checkout.getOrder().payment;
        return payment && payment.status;
    };
    PaypalExpressPaymentStrategy.prototype._isInContextEnabled = function () {
        return !!this._paymentMethod.config.merchantId;
    };
    return PaypalExpressPaymentStrategy;
}(payment_strategy_1.default));
exports.default = PaypalExpressPaymentStrategy;
//# sourceMappingURL=paypal-express-payment-strategy.js.map