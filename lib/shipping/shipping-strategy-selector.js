"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ShippingStrategySelector = (function () {
    function ShippingStrategySelector(_shippingStrategy) {
        this._shippingStrategy = _shippingStrategy;
    }
    ShippingStrategySelector.prototype.getUpdateAddressError = function (methodId) {
        if (methodId && this._shippingStrategy.errors.updateAddressMethodId !== methodId) {
            return;
        }
        return this._shippingStrategy.errors.updateAddressError;
    };
    ShippingStrategySelector.prototype.getSelectOptionError = function (methodId) {
        if (methodId && this._shippingStrategy.errors.selectOptionMethodId !== methodId) {
            return;
        }
        return this._shippingStrategy.errors.selectOptionError;
    };
    ShippingStrategySelector.prototype.getInitializeError = function (methodId) {
        if (methodId && this._shippingStrategy.errors.initializeMethodId !== methodId) {
            return;
        }
        return this._shippingStrategy.errors.initializeError;
    };
    ShippingStrategySelector.prototype.isUpdatingAddress = function (methodId) {
        if (methodId && this._shippingStrategy.statuses.updateAddressMethodId !== methodId) {
            return false;
        }
        return !!this._shippingStrategy.statuses.isUpdatingAddress;
    };
    ShippingStrategySelector.prototype.isSelectingOption = function (methodId) {
        if (methodId && this._shippingStrategy.statuses.selectOptionMethodId !== methodId) {
            return false;
        }
        return !!this._shippingStrategy.statuses.isSelectingOption;
    };
    ShippingStrategySelector.prototype.isInitializing = function (methodId) {
        if (methodId && this._shippingStrategy.statuses.initializeMethodId !== methodId) {
            return false;
        }
        return !!this._shippingStrategy.statuses.isInitializing;
    };
    return ShippingStrategySelector;
}());
exports.default = ShippingStrategySelector;
//# sourceMappingURL=shipping-strategy-selector.js.map