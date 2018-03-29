"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodash_1 = require("lodash");
var payment_strategy_1 = require("./payment-strategy");
var NoPaymentDataRequiredPaymentStrategy = (function (_super) {
    tslib_1.__extends(NoPaymentDataRequiredPaymentStrategy, _super);
    function NoPaymentDataRequiredPaymentStrategy() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NoPaymentDataRequiredPaymentStrategy.prototype.execute = function (orderRequest, options) {
        return this._placeOrderService.submitOrder(lodash_1.omit(orderRequest, 'payment'), true, options);
    };
    return NoPaymentDataRequiredPaymentStrategy;
}(payment_strategy_1.default));
exports.default = NoPaymentDataRequiredPaymentStrategy;
//# sourceMappingURL=no-payment-data-required-strategy.js.map