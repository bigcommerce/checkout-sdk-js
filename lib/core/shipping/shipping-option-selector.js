"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
var ShippingOptionSelector = (function () {
    function ShippingOptionSelector(shippingOptions, quote) {
        if (shippingOptions === void 0) { shippingOptions = {}; }
        if (quote === void 0) { quote = {}; }
        this._shippingOptions = shippingOptions;
        this._quote = quote;
    }
    ShippingOptionSelector.prototype.getShippingOptions = function () {
        return this._shippingOptions.data;
    };
    ShippingOptionSelector.prototype.getSelectedShippingOption = function () {
        var _a = this._quote.data, shippingAddress = _a.shippingAddress, optionId = _a.shippingOption;
        var shippingOptions = shippingAddress ? this.getShippingOptions()[shippingAddress.id] : undefined;
        return lodash_1.find(shippingOptions, { id: optionId });
    };
    ShippingOptionSelector.prototype.getLoadError = function () {
        return this._shippingOptions.errors && this._shippingOptions.errors.loadError;
    };
    ShippingOptionSelector.prototype.getSelectError = function () {
        return this._shippingOptions.errors && this._shippingOptions.errors.selectError;
    };
    ShippingOptionSelector.prototype.isLoading = function () {
        return !!(this._shippingOptions.statuses && this._shippingOptions.statuses.isLoading);
    };
    ShippingOptionSelector.prototype.isSelecting = function () {
        return !!(this._shippingOptions.statuses && this._shippingOptions.statuses.isSelecting);
    };
    return ShippingOptionSelector;
}());
exports.default = ShippingOptionSelector;
//# sourceMappingURL=shipping-option-selector.js.map