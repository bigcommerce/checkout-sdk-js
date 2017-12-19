"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodash_1 = require("lodash");
var payment_strategy_1 = require("./payment-strategy");
var OfflinePaymentStrategy = /** @class */ (function (_super) {
    tslib_1.__extends(OfflinePaymentStrategy, _super);
    function OfflinePaymentStrategy() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * @inheritdoc
     */
    OfflinePaymentStrategy.prototype.execute = function (payload, options) {
        return this._placeOrderService.submitOrder(tslib_1.__assign({}, payload, { payment: lodash_1.pick(payload.payment, 'name') }), options);
    };
    return OfflinePaymentStrategy;
}(payment_strategy_1.default));
exports.default = OfflinePaymentStrategy;
//# sourceMappingURL=offline-payment-strategy.js.map