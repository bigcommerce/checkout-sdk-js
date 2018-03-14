"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var customer_strategy_1 = require("./customer-strategy");
var DefaultCustomerStrategy = (function (_super) {
    tslib_1.__extends(DefaultCustomerStrategy, _super);
    function DefaultCustomerStrategy() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DefaultCustomerStrategy.prototype.signIn = function (credentials, options) {
        return this._signInCustomerService.signIn(credentials, options);
    };
    DefaultCustomerStrategy.prototype.signOut = function (options) {
        return this._signInCustomerService.signOut(options);
    };
    return DefaultCustomerStrategy;
}(customer_strategy_1.default));
exports.default = DefaultCustomerStrategy;
//# sourceMappingURL=default-customer-strategy.js.map