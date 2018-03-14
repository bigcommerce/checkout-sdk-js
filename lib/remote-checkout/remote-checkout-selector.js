"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RemoteCheckoutSelector = (function () {
    function RemoteCheckoutSelector(_remoteCheckout) {
        this._remoteCheckout = _remoteCheckout;
    }
    RemoteCheckoutSelector.prototype.getCheckout = function () {
        return this._remoteCheckout.data;
    };
    RemoteCheckoutSelector.prototype.getCheckoutMeta = function () {
        return this._remoteCheckout.meta;
    };
    RemoteCheckoutSelector.prototype.getInitializeBillingError = function (methodId) {
        if (methodId && this._remoteCheckout.errors.failedBillingMethod !== methodId) {
            return false;
        }
        return this._remoteCheckout.errors.initializeBillingError;
    };
    RemoteCheckoutSelector.prototype.getInitializeShippingError = function (methodId) {
        if (methodId && this._remoteCheckout.errors.failedShippingMethod !== methodId) {
            return false;
        }
        return this._remoteCheckout.errors.initializeShippingError;
    };
    RemoteCheckoutSelector.prototype.getInitializePaymentError = function (methodId) {
        if (methodId && this._remoteCheckout.errors.failedPaymentMethod !== methodId) {
            return false;
        }
        return this._remoteCheckout.errors.initializePaymentError;
    };
    RemoteCheckoutSelector.prototype.getSignOutError = function () {
        return this._remoteCheckout.errors.signOutError;
    };
    RemoteCheckoutSelector.prototype.isInitializingBilling = function (methodId) {
        if (methodId && this._remoteCheckout.statuses.loadingBillingMethod !== methodId) {
            return false;
        }
        return !!this._remoteCheckout.statuses.isInitializingBilling;
    };
    RemoteCheckoutSelector.prototype.isInitializingShipping = function () {
        return !!this._remoteCheckout.statuses.isInitializingShipping;
    };
    RemoteCheckoutSelector.prototype.isInitializingPayment = function (methodId) {
        if (methodId && this._remoteCheckout.statuses.loadingPaymentMethod !== methodId) {
            return false;
        }
        return !!this._remoteCheckout.statuses.isInitializingPayment;
    };
    RemoteCheckoutSelector.prototype.isSigningOut = function () {
        return !!this._remoteCheckout.statuses.isSigningOut;
    };
    return RemoteCheckoutSelector;
}());
exports.default = RemoteCheckoutSelector;
//# sourceMappingURL=remote-checkout-selector.js.map