"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodash_1 = require("lodash");
var payment_strategy_1 = require("./payment-strategy");
var NoPaymentRequiredPaymentStrategy = (function (_super) {
    tslib_1.__extends(NoPaymentRequiredPaymentStrategy, _super);
    function NoPaymentRequiredPaymentStrategy() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NoPaymentRequiredPaymentStrategy.prototype.execute = function (orderRequest, options) {
        var useStoreCredit = orderRequest.useStoreCredit;
        return this._placeOrderService.submitOrder(lodash_1.omit(orderRequest, 'payment'), useStoreCredit, options);
    };
    return NoPaymentRequiredPaymentStrategy;
}(payment_strategy_1.default));
exports.default = NoPaymentRequiredPaymentStrategy;
//# sourceMappingURL=no-payment-data-required-strategy.js.map