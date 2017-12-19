"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CartSelector = /** @class */ (function () {
    /**
     * @constructor
     * @param {CartState} cart
     */
    function CartSelector(cart) {
        if (cart === void 0) { cart = {}; }
        this._cart = cart.data;
        this._cartMeta = cart.meta;
        this._errors = cart.errors;
        this._statuses = cart.statuses;
    }
    /**
     * @return {Cart}
     */
    CartSelector.prototype.getCart = function () {
        return this._cart;
    };
    /**
     * @return {boolean}
     */
    CartSelector.prototype.isValid = function () {
        return !!this._cartMeta.isValid;
    };
    /**
     * @return {?ErrorResponse}
     */
    CartSelector.prototype.getLoadError = function () {
        return this._errors && this._errors.loadError;
    };
    /**
     * @return {?ErrorResponse}
     */
    CartSelector.prototype.getVerifyError = function () {
        return this._errors && this._errors.verifyError;
    };
    /**
     * @return {boolean}
     */
    CartSelector.prototype.isLoading = function () {
        return !!(this._statuses && this._statuses.isLoading);
    };
    /**
     * @return {boolean}
     */
    CartSelector.prototype.isVerifying = function () {
        return !!(this._statuses && this._statuses.isVerifying);
    };
    return CartSelector;
}());
exports.default = CartSelector;
//# sourceMappingURL=cart-selector.js.map