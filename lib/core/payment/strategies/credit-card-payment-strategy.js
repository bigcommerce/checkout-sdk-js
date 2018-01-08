"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodash_1 = require("lodash");
var payment_strategy_1 = require("./payment-strategy");
var CreditCardPaymentStrategy = (function (_super) {
    tslib_1.__extends(CreditCardPaymentStrategy, _super);
    function CreditCardPaymentStrategy() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CreditCardPaymentStrategy.prototype.execute = function (payload, options) {
        var _this = this;
        return this._placeOrderService.submitOrder(lodash_1.omit(payload, 'payment'), options)
            .then(function () {
            return _this._placeOrderService.submitPayment(payload.payment, payload.useStoreCredit, options);
        });
    };
    return CreditCardPaymentStrategy;
}(payment_strategy_1.default));
exports.default = CreditCardPaymentStrategy;
//# sourceMappingURL=credit-card-payment-strategy.js.map