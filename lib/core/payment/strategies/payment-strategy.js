"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var errors_1 = require("../../order/errors");
var PaymentStrategy = (function () {
    function PaymentStrategy(_paymentMethod, _store, _placeOrderService) {
        this._paymentMethod = _paymentMethod;
        this._store = _store;
        this._placeOrderService = _placeOrderService;
    }
    PaymentStrategy.prototype.finalize = function (options) {
        return Promise.reject(new errors_1.OrderFinalizationNotRequiredError());
    };
    PaymentStrategy.prototype.initialize = function (options) {
        return Promise.resolve(this._store.getState());
    };
    PaymentStrategy.prototype.deinitialize = function (options) {
        return Promise.resolve(this._store.getState());
    };
    return PaymentStrategy;
}());
exports.default = PaymentStrategy;
//# sourceMappingURL=payment-strategy.js.map