"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodash_1 = require("lodash");
var errors_1 = require("../../common/error/errors");
var errors_2 = require("../../remote-checkout/errors");
var payment_strategy_1 = require("./payment-strategy");
var AmazonPayPaymentStrategy = (function (_super) {
    tslib_1.__extends(AmazonPayPaymentStrategy, _super);
    function AmazonPayPaymentStrategy(paymentMethod, store, placeOrderService, _remoteCheckoutService, _scriptLoader) {
        var _this = _super.call(this, paymentMethod, store, placeOrderService) || this;
        _this._remoteCheckoutService = _remoteCheckoutService;
        _this._scriptLoader = _scriptLoader;
        _this._window = window;
        return _this;
    }
    AmazonPayPaymentStrategy.prototype.initialize = function (options) {
        var _this = this;
        this._walletOptions = options;
        this._window.onAmazonPaymentsReady = function () {
            _this._wallet = _this._createWallet(options);
        };
        return this._scriptLoader.loadWidget(this._paymentMethod)
            .then(function () {
            _this._unsubscribe = _this._store.subscribe(_this._handleGrandTotalChange.bind(_this), function (_a) {
                var checkout = _a.checkout;
                return checkout.getCart() && checkout.getCart().grandTotal;
            });
            return _super.prototype.initialize.call(_this, options);
        });
    };
    AmazonPayPaymentStrategy.prototype.deinitialize = function (options) {
        if (this._unsubscribe) {
            this._unsubscribe();
        }
        this._wallet = undefined;
        return _super.prototype.deinitialize.call(this, options);
    };
    AmazonPayPaymentStrategy.prototype.execute = function (payload, options) {
        var _this = this;
        var id = this._paymentMethod.id;
        var checkout = this._store.getState().checkout;
        var referenceId = checkout.getCheckoutMeta().remoteCheckout.amazon.referenceId;
        return this._remoteCheckoutService.initializePayment(id, { referenceId: referenceId })
            .then(function () { return _this._placeOrderService.submitOrder(tslib_1.__assign({}, payload, { payment: lodash_1.omit(payload.payment, 'paymentData') }), options); })
            .catch(function (error) {
            if (error instanceof errors_1.RequestError && error.body.type === 'provider_widget_error') {
                _this._wallet = _this._refreshWallet();
            }
            return Promise.reject(error);
        });
    };
    AmazonPayPaymentStrategy.prototype._createWallet = function (options) {
        var _this = this;
        var container = options.container, _a = options.onError, onError = _a === void 0 ? lodash_1.noop : _a, _b = options.onPaymentSelect, onPaymentSelect = _b === void 0 ? lodash_1.noop : _b;
        var merchantId = this._paymentMethod.config.merchantId;
        var widget = new OffAmazonPayments.Widgets.Wallet({
            design: { designMode: 'responsive' },
            scope: 'payments:billing_address payments:shipping_address payments:widget profile',
            sellerId: merchantId,
            onError: function (error) {
                _this._handleError(error, onError);
            },
            onPaymentSelect: function (orderReference) {
                _this._handlePaymentSelect(orderReference, onPaymentSelect);
            },
        });
        widget.bind(container);
        return widget;
    };
    AmazonPayPaymentStrategy.prototype._refreshWallet = function () {
        if (!this._walletOptions) {
            throw new errors_1.NotInitializedError();
        }
        var checkout = this._store.getState().checkout;
        var referenceId = checkout.getCheckoutMeta().remoteCheckout.amazon.referenceId;
        return this._createWallet(tslib_1.__assign({}, this._walletOptions, { amazonOrderReferenceId: referenceId }));
    };
    AmazonPayPaymentStrategy.prototype._handlePaymentSelect = function (orderReference, callback) {
        var _this = this;
        var id = this._paymentMethod.id;
        var checkout = this._store.getState().checkout;
        var referenceId = checkout.getCheckoutMeta().remoteCheckout.amazon.referenceId;
        callback(checkout.getBillingAddress());
        this._remoteCheckoutService.initializePayment(id, { referenceId: referenceId })
            .then(function () { return _this._remoteCheckoutService.synchronizeBillingAddress(id, { referenceId: referenceId }); })
            .then(function (_a) {
            var checkout = _a.checkout;
            return callback(checkout.getBillingAddress());
        });
    };
    AmazonPayPaymentStrategy.prototype._handleGrandTotalChange = function (_a) {
        var checkout = _a.checkout;
        var id = this._paymentMethod.id;
        var remoteCheckout = checkout.getCheckoutMeta().remoteCheckout;
        if (!remoteCheckout || !remoteCheckout.amazon || !remoteCheckout.amazon.referenceId) {
            return;
        }
        this._remoteCheckoutService.initializePayment(id, {
            referenceId: remoteCheckout.amazon.referenceId,
        });
    };
    AmazonPayPaymentStrategy.prototype._handleError = function (error, callback) {
        if (!error) {
            return;
        }
        if (error.getErrorCode() === 'BuyerSessionExpired') {
            callback(new errors_2.RemoteCheckoutSessionError(error));
        }
        else {
            callback(new errors_2.RemoteCheckoutPaymentError(error));
        }
    };
    return AmazonPayPaymentStrategy;
}(payment_strategy_1.default));
exports.default = AmazonPayPaymentStrategy;
//# sourceMappingURL=amazon-pay-payment-strategy.js.map