"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var customer_strategy_1 = require("./customer-strategy");
var DefaultCustomerStrategy = (function (_super) {
    tslib_1.__extends(DefaultCustomerStrategy, _super);
    function DefaultCustomerStrategy(store, _customerActionCreator) {
        var _this = _super.call(this, store) || this;
        _this._customerActionCreator = _customerActionCreator;
        return _this;
    }
    DefaultCustomerStrategy.prototype.signIn = function (credentials, options) {
        return this._store.dispatch(this._customerActionCreator.signInCustomer(credentials, options));
    };
    DefaultCustomerStrategy.prototype.signOut = function (options) {
        return this._store.dispatch(this._customerActionCreator.signOutCustomer(options));
    };
    return DefaultCustomerStrategy;
}(customer_strategy_1.default));
exports.default = DefaultCustomerStrategy;
//# sourceMappingURL=default-customer-strategy.js.map