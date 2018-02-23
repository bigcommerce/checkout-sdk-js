"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var errors_1 = require("../../order/errors");
var PaymentStrategy = (function () {
    function PaymentStrategy(_store, _placeOrderService) {
        this._store = _store;
        this._placeOrderService = _placeOrderService;
        this._isInitialized = false;
    }
    PaymentStrategy.prototype.finalize = function (options) {
        return Promise.reject(new errors_1.OrderFinalizationNotRequiredError());
    };
    PaymentStrategy.prototype.initialize = function (options) {
        this._isInitialized = true;
        this._paymentMethod = options.paymentMethod;
        return Promise.resolve(this._store.getState());
    };
    PaymentStrategy.prototype.deinitialize = function (options) {
        this._isInitialized = false;
        this._paymentMethod = undefined;
        return Promise.resolve(this._store.getState());
    };
    return PaymentStrategy;
}());
exports.default = PaymentStrategy;
//# sourceMappingURL=payment-strategy.js.map