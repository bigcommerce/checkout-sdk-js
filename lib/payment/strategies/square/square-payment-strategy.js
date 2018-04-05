"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodash_1 = require("lodash");
var errors_1 = require("../../../common/error/errors");
var errors_2 = require("../../errors");
var payment_strategy_1 = require("../payment-strategy");
var SquarePaymentStrategy = (function (_super) {
    tslib_1.__extends(SquarePaymentStrategy, _super);
    function SquarePaymentStrategy(store, placeOrderService, _scriptLoader) {
        var _this = _super.call(this, store, placeOrderService) || this;
        _this._scriptLoader = _scriptLoader;
        return _this;
    }
    SquarePaymentStrategy.prototype.initialize = function (options) {
        var _this = this;
        return this._scriptLoader.load()
            .then(function (createSquareForm) {
            return new Promise(function (resolve, reject) {
                _this._paymentForm = createSquareForm(_this._getFormOptions(options, { resolve: resolve, reject: reject }));
                _this._paymentForm.build();
            });
        })
            .then(function () { return _super.prototype.initialize.call(_this, options); });
    };
    SquarePaymentStrategy.prototype.execute = function (payload, options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!_this._paymentForm) {
                throw new errors_2.PaymentMethodUninitializedError('Square');
            }
            if (_this._deferredRequestNonce) {
                _this._deferredRequestNonce.reject(new errors_1.TimeoutError());
            }
            _this._deferredRequestNonce = { resolve: resolve, reject: reject };
            _this._paymentForm.requestCardNonce();
        })
            .then(function (paymentData) { return _this._placeOrderService.submitOrder(lodash_1.omit(payload, 'payment'), true, options); });
    };
    SquarePaymentStrategy.prototype._getFormOptions = function (options, deferred) {
        var _this = this;
        var paymentMethod = options.paymentMethod, widgetConfig = options.widgetConfig;
        if (!widgetConfig) {
            throw new errors_2.PaymentMethodMissingDataError('widgetConfig');
        }
        return tslib_1.__assign({}, widgetConfig, paymentMethod.initializationData, { callbacks: {
                paymentFormLoaded: function () {
                    deferred.resolve();
                    var state = _this._store.getState();
                    var billingAddress = state.checkout.getBillingAddress();
                    if (billingAddress && billingAddress.postCode) {
                        _this._paymentForm.setPostalCode(billingAddress.postCode);
                    }
                },
                unsupportedBrowserDetected: function () {
                    deferred.reject(new errors_1.UnsupportedBrowserError());
                },
                cardNonceResponseReceived: function (errors, nonce) {
                    _this._cardNonceResponseReceived(errors, nonce);
                },
            } });
    };
    SquarePaymentStrategy.prototype._cardNonceResponseReceived = function (errors, nonce) {
        if (errors) {
            this._deferredRequestNonce.reject(errors);
        }
        else {
            this._deferredRequestNonce.resolve({ nonce: nonce });
        }
    };
    return SquarePaymentStrategy;
}(payment_strategy_1.default));
exports.default = SquarePaymentStrategy;
//# sourceMappingURL=square-payment-strategy.js.map