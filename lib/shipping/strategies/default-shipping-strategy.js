"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var shipping_strategy_1 = require("./shipping-strategy");
var DefaultShippingStrategy = (function (_super) {
    tslib_1.__extends(DefaultShippingStrategy, _super);
    function DefaultShippingStrategy(store, updateShippingService) {
        return _super.call(this, store, updateShippingService) || this;
    }
    DefaultShippingStrategy.prototype.updateAddress = function (address, options) {
        return this._updateShippingService.updateAddress(address, options);
    };
    DefaultShippingStrategy.prototype.selectOption = function (addressId, optionId, options) {
        return this._updateShippingService.selectOption(addressId, optionId, options);
    };
    return DefaultShippingStrategy;
}(shipping_strategy_1.default));
exports.default = DefaultShippingStrategy;
//# sourceMappingURL=default-shipping-strategy.js.map