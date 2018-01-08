"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ShippingAddressSelector = (function () {
    function ShippingAddressSelector(quote) {
        if (quote === void 0) { quote = {}; }
        this._quote = quote;
    }
    ShippingAddressSelector.prototype.getShippingAddress = function () {
        return this._quote.data.shippingAddress;
    };
    ShippingAddressSelector.prototype.getUpdateError = function () {
        return this._quote.errors &&
            this._quote.errors.updateShippingAddressError;
    };
    ShippingAddressSelector.prototype.isUpdating = function () {
        return !!(this._quote.statuses &&
            this._quote.statuses.isUpdatingShippingAddress);
    };
    return ShippingAddressSelector;
}());
exports.default = ShippingAddressSelector;
//# sourceMappingURL=shipping-address-selector.js.map