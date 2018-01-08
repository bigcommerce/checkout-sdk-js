"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var payment_strategy_1 = require("./payment-strategy");
var LegacyPaymentStrategy = (function (_super) {
    tslib_1.__extends(LegacyPaymentStrategy, _super);
    function LegacyPaymentStrategy() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LegacyPaymentStrategy.prototype.execute = function (payload, options) {
        return this._placeOrderService.submitOrder(payload, options);
    };
    return LegacyPaymentStrategy;
}(payment_strategy_1.default));
exports.default = LegacyPaymentStrategy;
//# sourceMappingURL=legacy-payment-strategy.js.map