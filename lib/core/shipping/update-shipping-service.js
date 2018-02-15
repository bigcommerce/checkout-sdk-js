"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var UpdateShippingService = (function () {
    function UpdateShippingService(_store, _addressActionCreator, _optionActionCreator) {
        this._store = _store;
        this._addressActionCreator = _addressActionCreator;
        this._optionActionCreator = _optionActionCreator;
    }
    UpdateShippingService.prototype.updateAddress = function (address, options) {
        return this._store.dispatch(this._addressActionCreator.updateAddress(address, options));
    };
    UpdateShippingService.prototype.selectOption = function (addressId, optionId, options) {
        return this._store.dispatch(this._optionActionCreator.selectShippingOption(addressId, optionId, options));
    };
    return UpdateShippingService;
}());
exports.default = UpdateShippingService;
//# sourceMappingURL=update-shipping-service.js.map