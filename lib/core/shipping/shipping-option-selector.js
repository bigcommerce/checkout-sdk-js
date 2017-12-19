"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
var ShippingOptionSelector = /** @class */ (function () {
    /**
     * @constructor
     * @param {ShippingOptionsState} shippingOptions
     * @param {QuoteState} quote
     */
    function ShippingOptionSelector(shippingOptions, quote) {
        if (shippingOptions === void 0) { shippingOptions = {}; }
        if (quote === void 0) { quote = {}; }
        this._shippingOptions = shippingOptions.data;
        this._quote = quote.data;
        this._errors = shippingOptions.errors;
        this._statuses = shippingOptions.statuses;
    }
    /**
     * @return {ShippingOptionList}
     */
    ShippingOptionSelector.prototype.getShippingOptions = function () {
        return this._shippingOptions;
    };
    /**
     * @return {?ShippingOption}
     */
    ShippingOptionSelector.prototype.getSelectedShippingOption = function () {
        var _a = this._quote, shippingAddress = _a.shippingAddress, optionId = _a.shippingOption;
        var shippingOptions = shippingAddress ? this.getShippingOptions()[shippingAddress.id] : undefined;
        return lodash_1.find(shippingOptions, { id: optionId });
    };
    /**
     * @return {?ErrorResponse}
     */
    ShippingOptionSelector.prototype.getLoadError = function () {
        return this._errors && this._errors.loadError;
    };
    /**
     * @return {?ErrorResponse}
     */
    ShippingOptionSelector.prototype.getSelectError = function () {
        return this._errors && this._errors.selectError;
    };
    /**
     * @return {boolean}
     */
    ShippingOptionSelector.prototype.isLoading = function () {
        return !!(this._statuses && this._statuses.isLoading);
    };
    /**
     * @return {boolean}
     */
    ShippingOptionSelector.prototype.isSelecting = function () {
        return !!(this._statuses && this._statuses.isSelecting);
    };
    return ShippingOptionSelector;
}());
exports.default = ShippingOptionSelector;
//# sourceMappingURL=shipping-option-selector.js.map