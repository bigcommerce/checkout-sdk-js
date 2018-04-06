"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var _1 = require(".");
var WepayPaymentStrategy = (function (_super) {
    tslib_1.__extends(WepayPaymentStrategy, _super);
    function WepayPaymentStrategy(store, placeOrderService, _wepayRiskClient) {
        var _this = _super.call(this, store, placeOrderService) || this;
        _this._wepayRiskClient = _wepayRiskClient;
        return _this;
    }
    WepayPaymentStrategy.prototype.initialize = function (options) {
        this._wepayRiskClient.initialize();
        return _super.prototype.initialize.call(this, options);
    };
    WepayPaymentStrategy.prototype.execute = function (payload, options) {
        var token = this._wepayRiskClient.getRiskToken();
        var payloadWithToken = tslib_1.__assign({}, payload);
        payloadWithToken.payment.paymentData.extraData = {
            riskToken: token,
        };
        return _super.prototype.execute.call(this, payloadWithToken, options);
    };
    return WepayPaymentStrategy;
}(_1.CreditCardPaymentStrategy));
exports.default = WepayPaymentStrategy;
//# sourceMappingURL=wepay-payment-strategy.js.map