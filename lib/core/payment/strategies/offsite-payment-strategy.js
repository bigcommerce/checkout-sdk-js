"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodash_1 = require("lodash");
var paymentStatusTypes = require("../payment-status-types");
var payment_strategy_1 = require("./payment-strategy");
var OffsitePaymentStrategy = /** @class */ (function (_super) {
    tslib_1.__extends(OffsitePaymentStrategy, _super);
    function OffsitePaymentStrategy() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * @inheritdoc
     */
    OffsitePaymentStrategy.prototype.execute = function (payload, options) {
        var _this = this;
        var _a = payload.payment, gateway = (_a === void 0 ? {} : _a).gateway;
        var orderPayload = gateway === 'adyen' ? payload : lodash_1.omit(payload, 'payment');
        return this._placeOrderService.submitOrder(orderPayload, options)
            .then(function () {
            return _this._placeOrderService.initializeOffsitePayment(payload.payment, payload.useStoreCredit, options);
        });
    };
    /**
     * @inheritdoc
     */
    OffsitePaymentStrategy.prototype.finalize = function (options) {
        var checkout = this._store.getState().checkout;
        var _a = checkout.getOrder(), orderId = _a.orderId, _b = _a.payment, payment = _b === void 0 ? {} : _b;
        if (orderId &&
            payment.status === paymentStatusTypes.ACKNOWLEDGE ||
            payment.status === paymentStatusTypes.FINALIZE) {
            return this._placeOrderService.finalizeOrder(orderId, options);
        }
        return Promise.resolve(this._store.getState());
    };
    return OffsitePaymentStrategy;
}(payment_strategy_1.default));
exports.default = OffsitePaymentStrategy;
//# sourceMappingURL=offsite-payment-strategy.js.map