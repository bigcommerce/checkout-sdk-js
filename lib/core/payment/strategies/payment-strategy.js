"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var errors_1 = require("../../common/error/errors");
var errors_2 = require("../../order/errors");
var PaymentStrategy = (function () {
    function PaymentStrategy(store, placeOrderService) {
        this._store = store;
        this._placeOrderService = placeOrderService;
    }
    PaymentStrategy.prototype.execute = function () {
        throw new errors_1.NotImplementedError();
    };
    PaymentStrategy.prototype.finalize = function () {
        return Promise.reject(new errors_2.OrderFinalizationNotRequiredError());
    };
    PaymentStrategy.prototype.initialize = function () {
        return Promise.resolve(this._store.getState());
    };
    PaymentStrategy.prototype.deinitialize = function () {
        return Promise.resolve(this._store.getState());
    };
    return PaymentStrategy;
}());
exports.default = PaymentStrategy;
//# sourceMappingURL=payment-strategy.js.map