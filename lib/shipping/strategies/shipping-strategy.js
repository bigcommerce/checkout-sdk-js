"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ShippingStrategy = (function () {
    function ShippingStrategy(_store) {
        this._store = _store;
        this._isInitialized = false;
    }
    ShippingStrategy.prototype.initialize = function (options) {
        this._isInitialized = true;
        return Promise.resolve(this._store.getState());
    };
    ShippingStrategy.prototype.deinitialize = function (options) {
        this._isInitialized = false;
        return Promise.resolve(this._store.getState());
    };
    return ShippingStrategy;
}());
exports.default = ShippingStrategy;
//# sourceMappingURL=shipping-strategy.js.map