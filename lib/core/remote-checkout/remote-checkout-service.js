"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var address_1 = require("../address");
var RemoteCheckoutService = (function () {
    function RemoteCheckoutService(store, billingAddressActionCreator, shippingAddressActionCreator, remoteCheckoutActionCreator) {
        this._store = store;
        this._billingAddressActionCreator = billingAddressActionCreator;
        this._shippingAddressActionCreator = shippingAddressActionCreator;
        this._remoteCheckoutActionCreator = remoteCheckoutActionCreator;
    }
    RemoteCheckoutService.prototype.initializeBilling = function (methodId, params, options) {
        return this._store.dispatch(this._remoteCheckoutActionCreator.initializeBilling(methodId, params, options));
    };
    RemoteCheckoutService.prototype.initializeShipping = function (methodId, params, options) {
        return this._store.dispatch(this._remoteCheckoutActionCreator.initializeShipping(methodId, params, options));
    };
    RemoteCheckoutService.prototype.initializePayment = function (methodId, params, options) {
        return this._store.dispatch(this._remoteCheckoutActionCreator.initializePayment(methodId, params, options));
    };
    RemoteCheckoutService.prototype.synchronizeBillingAddress = function (methodId, params, options) {
        var _this = this;
        return this.initializeBilling(methodId, params, options)
            .then(function (_a) {
            var checkout = _a.checkout;
            var _b = checkout.getCheckoutMeta().remoteCheckout, billingAddress = (_b === void 0 ? {} : _b).billingAddress;
            if (address_1.isAddressEqual(billingAddress, checkout.getBillingAddress()) || !billingAddress) {
                return _this._store.getState();
            }
            return _this._store.dispatch(_this._billingAddressActionCreator.updateAddress(billingAddress, options));
        });
    };
    RemoteCheckoutService.prototype.synchronizeShippingAddress = function (methodId, params, options) {
        var _this = this;
        return this.initializeShipping(methodId, params, options)
            .then(function (_a) {
            var checkout = _a.checkout;
            var _b = checkout.getCheckoutMeta().remoteCheckout, shippingAddress = (_b === void 0 ? {} : _b).shippingAddress;
            if (address_1.isAddressEqual(shippingAddress, checkout.getShippingAddress()) || !shippingAddress) {
                return _this._store.getState();
            }
            return _this._store.dispatch(_this._shippingAddressActionCreator.updateAddress(shippingAddress, options));
        });
    };
    RemoteCheckoutService.prototype.setCheckoutMeta = function (methodId, meta) {
        return this._store.dispatch(this._remoteCheckoutActionCreator.setCheckoutMeta(methodId, meta));
    };
    return RemoteCheckoutService;
}());
exports.default = RemoteCheckoutService;
//# sourceMappingURL=remote-checkout-service.js.map