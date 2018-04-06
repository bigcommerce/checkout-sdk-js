"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodash_1 = require("lodash");
var errors_1 = require("../../../common/error/errors");
var payment_strategy_1 = require("../payment-strategy");
var BraintreePaypalPaymentStrategy = (function (_super) {
    tslib_1.__extends(BraintreePaypalPaymentStrategy, _super);
    function BraintreePaypalPaymentStrategy(store, placeOrderService, _braintreePaymentProcessor, _credit) {
        if (_credit === void 0) { _credit = false; }
        var _this = _super.call(this, store, placeOrderService) || this;
        _this._braintreePaymentProcessor = _braintreePaymentProcessor;
        _this._credit = _credit;
        return _this;
    }
    BraintreePaypalPaymentStrategy.prototype.initialize = function (options) {
        var _this = this;
        var _a = options.paymentMethod, paymentId = _a.id, nonce = _a.nonce;
        if (nonce) {
            return _super.prototype.initialize.call(this, options);
        }
        return this._placeOrderService.loadPaymentMethod(paymentId)
            .then(function (_a) {
            var checkout = _a.checkout;
            var clientToken = checkout.getPaymentMethod(paymentId).clientToken;
            _this._braintreePaymentProcessor.initialize(clientToken, options);
            return _this._braintreePaymentProcessor.preloadPaypal();
        })
            .then(function () { return _super.prototype.initialize.call(_this, options); })
            .catch(function (error) { return _this._handleError(error); });
    };
    BraintreePaypalPaymentStrategy.prototype.execute = function (orderRequest, options) {
        var _this = this;
        var payment = orderRequest.payment, useStoreCredit = orderRequest.useStoreCredit;
        return Promise.all([
            this._preparePaymentData(payment),
            this._placeOrderService.submitOrder(lodash_1.omit(orderRequest, 'payment'), true, options),
        ])
            .then(function (_a) {
            var payment = _a[0];
            return _this._placeOrderService.submitPayment(payment, useStoreCredit, options);
        })
            .catch(function (error) { return _this._handleError(error); });
    };
    BraintreePaypalPaymentStrategy.prototype.deinitialize = function (options) {
        var _this = this;
        return this._braintreePaymentProcessor.deinitialize()
            .then(function () { return _super.prototype.deinitialize.call(_this, options); });
    };
    BraintreePaypalPaymentStrategy.prototype._handleError = function (error) {
        if (error.name === 'BraintreeError') {
            throw new errors_1.StandardError(error.message);
        }
        throw error;
    };
    BraintreePaypalPaymentStrategy.prototype._preparePaymentData = function (payment) {
        var checkout = this._store.getState().checkout;
        var amount = checkout.getCart().grandTotal.amount;
        var _a = checkout.getConfig(), currency = _a.currency, storeLanguage = _a.storeLanguage;
        var _b = this._paymentMethod, method = _b.method, nonce = _b.nonce;
        if (nonce) {
            return Promise.resolve(tslib_1.__assign({}, payment, { paymentData: { nonce: nonce, method: method } }));
        }
        var tokenizedCard = this._braintreePaymentProcessor
            .paypal(amount, storeLanguage, currency.code, this._credit);
        return this._braintreePaymentProcessor.appendSessionId(tokenizedCard)
            .then(function (paymentData) { return (tslib_1.__assign({}, payment, { paymentData: tslib_1.__assign({}, paymentData, { method: method }) })); });
    };
    return BraintreePaypalPaymentStrategy;
}(payment_strategy_1.default));
exports.default = BraintreePaypalPaymentStrategy;
//# sourceMappingURL=braintree-paypal-payment-strategy.js.map