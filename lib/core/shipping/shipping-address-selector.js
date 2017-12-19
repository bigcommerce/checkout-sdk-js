"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ShippingAddressSelector = /** @class */ (function () {
    /**
     * @constructor
     * @param {QuoteState} quote
     */
    function ShippingAddressSelector(quote) {
        if (quote === void 0) { quote = {}; }
        this._quote = quote;
    }
    /**
     * @return {Address}
     */
    ShippingAddressSelector.prototype.getShippingAddress = function () {
        return this._quote.data.shippingAddress;
    };
    /**
     * @return {?ErrorResponse}
     */
    ShippingAddressSelector.prototype.getUpdateError = function () {
        return this._quote.errors &&
            this._quote.errors.updateShippingAddressError;
    };
    /**
     * @return {boolean}
     */
    ShippingAddressSelector.prototype.isUpdating = function () {
        return !!(this._quote.statuses &&
            this._quote.statuses.isUpdatingShippingAddress);
    };
    return ShippingAddressSelector;
}());
exports.default = ShippingAddressSelector;
//# sourceMappingURL=shipping-address-selector.js.map