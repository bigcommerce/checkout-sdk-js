"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CustomerStrategySelector = (function () {
    function CustomerStrategySelector(_customerStrategy) {
        this._customerStrategy = _customerStrategy;
    }
    CustomerStrategySelector.prototype.getSignInError = function (methodId) {
        if (methodId && this._customerStrategy.errors.signInMethodId !== methodId) {
            return;
        }
        return this._customerStrategy.errors.signInError;
    };
    CustomerStrategySelector.prototype.getSignOutError = function (methodId) {
        if (methodId && this._customerStrategy.errors.signOutMethodId !== methodId) {
            return;
        }
        return this._customerStrategy.errors.signOutError;
    };
    CustomerStrategySelector.prototype.getInitializeError = function (methodId) {
        if (methodId && this._customerStrategy.errors.initializeMethodId !== methodId) {
            return;
        }
        return this._customerStrategy.errors.initializeError;
    };
    CustomerStrategySelector.prototype.isSigningIn = function (methodId) {
        if (methodId && this._customerStrategy.statuses.signInMethodId !== methodId) {
            return false;
        }
        return !!this._customerStrategy.statuses.isSigningIn;
    };
    CustomerStrategySelector.prototype.isSigningOut = function (methodId) {
        if (methodId && this._customerStrategy.statuses.signOutMethodId !== methodId) {
            return false;
        }
        return !!this._customerStrategy.statuses.isSigningOut;
    };
    CustomerStrategySelector.prototype.isInitializing = function (methodId) {
        if (methodId && this._customerStrategy.statuses.initializeMethodId !== methodId) {
            return false;
        }
        return !!this._customerStrategy.statuses.isInitializing;
    };
    return CustomerStrategySelector;
}());
exports.default = CustomerStrategySelector;
//# sourceMappingURL=customer-strategy-selector.js.map