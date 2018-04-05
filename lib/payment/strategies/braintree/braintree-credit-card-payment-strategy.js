"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodash_1 = require("lodash");
var errors_1 = require("../../../common/error/errors");
var is_credit_card_1 = require("../../is-credit-card");
var is_vaulted_instrument_1 = require("../../is-vaulted-instrument");
var payment_strategy_1 = require("../payment-strategy");
var BraintreeCreditCardPaymentStrategy = (function (_super) {
    tslib_1.__extends(BraintreeCreditCardPaymentStrategy, _super);
    function BraintreeCreditCardPaymentStrategy(store, placeOrderService, _braintreePaymentProcessor) {
        var _this = _super.call(this, store, placeOrderService) || this;
        _this._braintreePaymentProcessor = _braintreePaymentProcessor;
        return _this;
    }
    BraintreeCreditCardPaymentStrategy.prototype.initialize = function (options) {
        var _this = this;
        var paymentId = options.paymentMethod.id;
        return this._placeOrderService.loadPaymentMethod(paymentId)
            .then(function (_a) {
            var checkout = _a.checkout;
            var _b = checkout.getPaymentMethod(paymentId), clientToken = _b.clientToken, config = _b.config;
            _this._braintreePaymentProcessor.initialize(clientToken, options);
            _this._is3dsEnabled = config.is3dsEnabled;
            return _super.prototype.initialize.call(_this, options);
        })
            .catch(function (error) { return _this._handleError(error); });
    };
    BraintreeCreditCardPaymentStrategy.prototype.execute = function (orderRequest, options) {
        var _this = this;
        var payment = orderRequest.payment, useStoreCredit = orderRequest.useStoreCredit;
        var checkout = this._store.getState().checkout;
        return this._placeOrderService
            .submitOrder(lodash_1.omit(orderRequest, 'payment'), true, options)
            .then(function () {
            return checkout.isPaymentDataRequired(useStoreCredit) ?
                _this._preparePaymentData(payment) :
                Promise.resolve(payment);
        })
            .then(function (processedPayment) {
            return _this._placeOrderService.submitPayment(processedPayment, useStoreCredit, options);
        })
            .catch(function (error) { return _this._handleError(error); });
    };
    BraintreeCreditCardPaymentStrategy.prototype.deinitialize = function (options) {
        var _this = this;
        return this._braintreePaymentProcessor.deinitialize()
            .then(function () { return _super.prototype.deinitialize.call(_this, options); });
    };
    BraintreeCreditCardPaymentStrategy.prototype._handleError = function (error) {
        if (error.name === 'BraintreeError') {
            throw new errors_1.StandardError(error.message);
        }
        throw error;
    };
    BraintreeCreditCardPaymentStrategy.prototype._isUsingVaulting = function (paymentData) {
        if (is_credit_card_1.default(paymentData)) {
            return Boolean(paymentData.shouldSaveInstrument);
        }
        return is_vaulted_instrument_1.default(paymentData);
    };
    BraintreeCreditCardPaymentStrategy.prototype._preparePaymentData = function (payment) {
        var paymentData = payment.paymentData;
        var checkout = this._store.getState().checkout;
        if (paymentData && this._isUsingVaulting(paymentData)) {
            return Promise.resolve(payment);
        }
        var amount = checkout.getCart().grandTotal.amount;
        var billingAddress = checkout.getBillingAddress();
        var tokenizedCard = this._is3dsEnabled ?
            this._braintreePaymentProcessor.verifyCard(payment, billingAddress, amount) :
            this._braintreePaymentProcessor.tokenizeCard(payment, billingAddress);
        return this._braintreePaymentProcessor.appendSessionId(tokenizedCard)
            .then(function (paymentData) { return (tslib_1.__assign({}, payment, { paymentData: paymentData })); });
    };
    return BraintreeCreditCardPaymentStrategy;
}(payment_strategy_1.default));
exports.default = BraintreeCreditCardPaymentStrategy;
//# sourceMappingURL=braintree-credit-card-payment-strategy.js.map