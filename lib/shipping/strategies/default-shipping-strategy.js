"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var shipping_strategy_1 = require("./shipping-strategy");
var DefaultShippingStrategy = (function (_super) {
    tslib_1.__extends(DefaultShippingStrategy, _super);
    function DefaultShippingStrategy(store, _addressActionCreator, _optionActionCreator) {
        var _this = _super.call(this, store) || this;
        _this._addressActionCreator = _addressActionCreator;
        _this._optionActionCreator = _optionActionCreator;
        return _this;
    }
    DefaultShippingStrategy.prototype.updateAddress = function (address, options) {
        return this._store.dispatch(this._addressActionCreator.updateAddress(address, options));
    };
    DefaultShippingStrategy.prototype.selectOption = function (addressId, optionId, options) {
        return this._store.dispatch(this._optionActionCreator.selectShippingOption(addressId, optionId, options));
    };
    return DefaultShippingStrategy;
}(shipping_strategy_1.default));
exports.default = DefaultShippingStrategy;
//# sourceMappingURL=default-shipping-strategy.js.map