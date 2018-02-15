"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodash_1 = require("lodash");
var payment_strategy_1 = require("./payment-strategy");
var errors_1 = require("../errors");
var AfterpayPaymentStrategy = (function (_super) {
    tslib_1.__extends(AfterpayPaymentStrategy, _super);
    function AfterpayPaymentStrategy(paymentMethod, store, placeOrderService, _remoteCheckoutService, _afterpayScriptLoader) {
        var _this = _super.call(this, paymentMethod, store, placeOrderService) || this;
        _this._remoteCheckoutService = _remoteCheckoutService;
        _this._afterpayScriptLoader = _afterpayScriptLoader;
        return _this;
    }
    AfterpayPaymentStrategy.prototype.initialize = function (options) {
        var _this = this;
        return this._afterpayScriptLoader.load(this._paymentMethod)
            .then(function (afterpaySdk) {
            _this._afterpaySdk = afterpaySdk;
            return _super.prototype.initialize.call(_this, options);
        });
    };
    AfterpayPaymentStrategy.prototype.deinitialize = function (options) {
        if (this._afterpaySdk) {
            this._afterpaySdk = undefined;
        }
        return _super.prototype.deinitialize.call(this, options);
    };
    AfterpayPaymentStrategy.prototype.execute = function (payload, options) {
        var _this = this;
        var paymentId = payload.payment.gateway;
        var useStoreCredit = !!payload.useStoreCredit;
        if (!paymentId) {
            throw new errors_1.PaymentMethodMissingDataError('gateway');
        }
        return this._remoteCheckoutService.initializePayment(paymentId, { useStoreCredit: useStoreCredit })
            .then(function () { return _this._placeOrderService.loadPaymentMethod(paymentId); })
            .then(function (resp) { return _this._displayModal(resp.checkout.getPaymentMethod(paymentId).clientToken); })
            .then(function () { return _this._resolveBeforeUnload(); });
    };
    AfterpayPaymentStrategy.prototype.finalize = function (options) {
        var _this = this;
        var payload = {
            payment: {
                name: this._paymentMethod.id,
                paymentData: { nonce: options.nonce },
            },
        };
        return this._placeOrderService.submitOrder(lodash_1.omit(payload, 'payment'), true, options)
            .then(function () {
            return _this._placeOrderService.submitPayment(payload.payment, false, lodash_1.omit(options, 'nonce'));
        });
    };
    AfterpayPaymentStrategy.prototype._displayModal = function (token) {
        if (!this._afterpaySdk || !token) {
            throw new errors_1.PaymentMethodUninitializedError(this._paymentMethod.gateway);
        }
        this._afterpaySdk.init();
        this._afterpaySdk.display({ token: token });
    };
    AfterpayPaymentStrategy.prototype._resolveBeforeUnload = function () {
        return new Promise(function (resolve) {
            var handleUnload = function () {
                window.removeEventListener('unload', handleUnload);
                resolve();
            };
            window.addEventListener('unload', handleUnload);
        });
    };
    return AfterpayPaymentStrategy;
}(payment_strategy_1.default));
exports.default = AfterpayPaymentStrategy;
//# sourceMappingURL=afterpay-payment-strategy.js.map