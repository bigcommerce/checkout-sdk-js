"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BillingAddressSelector = /** @class */ (function () {
    /**
     * @constructor
     * @param {QuoteState} quote
     */
    function BillingAddressSelector(quote) {
        if (quote === void 0) { quote = {}; }
        this._quote = quote;
    }
    /**
     * @return {Address}
     */
    BillingAddressSelector.prototype.getBillingAddress = function () {
        return this._quote.data.billingAddress;
    };
    /**
     * @return {?ErrorResponse}
     */
    BillingAddressSelector.prototype.getUpdateError = function () {
        return this._quote.errors &&
            this._quote.errors.updateBillingAddressError;
    };
    /**
     * @return {boolean}
     */
    BillingAddressSelector.prototype.isUpdating = function () {
        return !!(this._quote.statuses &&
            this._quote.statuses.isUpdatingBillingAddress);
    };
    return BillingAddressSelector;
}());
exports.default = BillingAddressSelector;
//# sourceMappingURL=billing-address-selector.js.map