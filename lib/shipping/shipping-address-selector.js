"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ShippingAddressSelector = (function () {
    function ShippingAddressSelector(quote) {
        if (quote === void 0) { quote = {}; }
        this._quote = quote;
    }
    ShippingAddressSelector.prototype.getShippingAddress = function () {
        return this._quote.data && this._quote.data.shippingAddress;
    };
    return ShippingAddressSelector;
}());
exports.default = ShippingAddressSelector;
//# sourceMappingURL=shipping-address-selector.js.map