"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CustomerStrategy = (function () {
    function CustomerStrategy(_store, _signInCustomerService) {
        this._store = _store;
        this._signInCustomerService = _signInCustomerService;
        this._isInitialized = false;
    }
    CustomerStrategy.prototype.initialize = function (options) {
        this._isInitialized = true;
        return Promise.resolve(this._store.getState());
    };
    CustomerStrategy.prototype.deinitialize = function (options) {
        this._isInitialized = false;
        return Promise.resolve(this._store.getState());
    };
    return CustomerStrategy;
}());
exports.default = CustomerStrategy;
//# sourceMappingURL=customer-strategy.js.map