"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodash_1 = require("lodash");
var paymentStatusTypes = require("../payment-status-types");
var payment_strategy_1 = require("./payment-strategy");
var PaypalProPaymentStrategy = /** @class */ (function (_super) {
    tslib_1.__extends(PaypalProPaymentStrategy, _super);
    function PaypalProPaymentStrategy() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * @inheritdoc
     */
    PaypalProPaymentStrategy.prototype.execute = function (payload, options) {
        var _this = this;
        if (this._isPaymentAcknowledged()) {
            return this._placeOrderService.submitOrder(tslib_1.__assign({}, payload, { payment: lodash_1.pick(payload.payment, 'name') }), options);
        }
        return this._placeOrderService.submitOrder(lodash_1.omit(payload, 'payment'), options)
            .then(function () {
            return _this._placeOrderService.submitPayment(payload.payment, payload.useStoreCredit, options);
        });
    };
    /**
     * @private
     * @return {boolean}
     */
    PaypalProPaymentStrategy.prototype._isPaymentAcknowledged = function () {
        var checkout = this._store.getState().checkout;
        var _a = checkout.getOrder().payment, payment = _a === void 0 ? {} : _a;
        return payment.status === paymentStatusTypes.ACKNOWLEDGE;
    };
    return PaypalProPaymentStrategy;
}(payment_strategy_1.default));
exports.default = PaypalProPaymentStrategy;
//# sourceMappingURL=paypal-pro-payment-strategy.js.map