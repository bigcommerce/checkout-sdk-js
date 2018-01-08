"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PaymentStrategy = (function () {
    function PaymentStrategy(store, placeOrderService) {
        this._store = store;
        this._placeOrderService = placeOrderService;
    }
    PaymentStrategy.prototype.execute = function () {
        throw new Error('Not implemented');
    };
    PaymentStrategy.prototype.finalize = function () {
        return Promise.reject(this._store.getState());
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