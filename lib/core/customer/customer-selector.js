"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CustomerSelector = /** @class */ (function () {
    /**
     * @constructor
     * @param {CustomerState} customer
     */
    function CustomerSelector(customer) {
        if (customer === void 0) { customer = {}; }
        this._customer = customer.data;
        this._errors = customer.errors;
        this._statuses = customer.statuses;
    }
    /**
     * @return {Customer}
     */
    CustomerSelector.prototype.getCustomer = function () {
        return this._customer;
    };
    /**
     * @return {?ErrorResponse}
     */
    CustomerSelector.prototype.getSignInError = function () {
        return this._errors && this._errors.signInError;
    };
    /**
     * @return {?ErrorResponse}
     */
    CustomerSelector.prototype.getSignOutError = function () {
        return this._errors && this._errors.signOutError;
    };
    /**
     * @return {boolean}
     */
    CustomerSelector.prototype.isSigningIn = function () {
        return !!(this._statuses && this._statuses.isSigningIn);
    };
    /**
     * @return {boolean}
     */
    CustomerSelector.prototype.isSigningOut = function () {
        return !!(this._statuses && this._statuses.isSigningOut);
    };
    return CustomerSelector;
}());
exports.default = CustomerSelector;
//# sourceMappingURL=customer-selector.js.map