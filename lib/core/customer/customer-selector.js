"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CustomerSelector = (function () {
    function CustomerSelector(customer) {
        if (customer === void 0) { customer = {}; }
        this._customer = customer;
    }
    CustomerSelector.prototype.getCustomer = function () {
        return this._customer.data;
    };
    CustomerSelector.prototype.getSignInError = function () {
        return this._customer.errors && this._customer.errors.signInError;
    };
    CustomerSelector.prototype.getSignOutError = function () {
        return this._customer.errors && this._customer.errors.signOutError;
    };
    CustomerSelector.prototype.isSigningIn = function () {
        return !!(this._customer.statuses && this._customer.statuses.isSigningIn);
    };
    CustomerSelector.prototype.isSigningOut = function () {
        return !!(this._customer.statuses && this._customer.statuses.isSigningOut);
    };
    return CustomerSelector;
}());
exports.default = CustomerSelector;
//# sourceMappingURL=customer-selector.js.map