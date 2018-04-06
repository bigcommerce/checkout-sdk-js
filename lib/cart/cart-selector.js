"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CartSelector = (function () {
    function CartSelector(_cart) {
        if (_cart === void 0) { _cart = {}; }
        this._cart = _cart;
    }
    CartSelector.prototype.getCart = function () {
        return this._cart.data;
    };
    CartSelector.prototype.isValid = function () {
        return !!(this._cart.meta && this._cart.meta.isValid);
    };
    CartSelector.prototype.getLoadError = function () {
        return this._cart.errors && this._cart.errors.loadError;
    };
    CartSelector.prototype.getVerifyError = function () {
        return this._cart.errors && this._cart.errors.verifyError;
    };
    CartSelector.prototype.isLoading = function () {
        return !!(this._cart.statuses && this._cart.statuses.isLoading);
    };
    CartSelector.prototype.isVerifying = function () {
        return !!(this._cart.statuses && this._cart.statuses.isVerifying);
    };
    return CartSelector;
}());
exports.default = CartSelector;
//# sourceMappingURL=cart-selector.js.map