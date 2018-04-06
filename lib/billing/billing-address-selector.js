"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BillingAddressSelector = (function () {
    function BillingAddressSelector(_quote) {
        if (_quote === void 0) { _quote = {}; }
        this._quote = _quote;
    }
    BillingAddressSelector.prototype.getBillingAddress = function () {
        return this._quote.data && this._quote.data.billingAddress;
    };
    BillingAddressSelector.prototype.getUpdateError = function () {
        return this._quote.errors && this._quote.errors.updateBillingAddressError;
    };
    BillingAddressSelector.prototype.isUpdating = function () {
        return !!(this._quote.statuses && this._quote.statuses.isUpdatingBillingAddress);
    };
    return BillingAddressSelector;
}());
exports.default = BillingAddressSelector;
//# sourceMappingURL=billing-address-selector.js.map