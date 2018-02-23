"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ShippingSelector = (function () {
    function ShippingSelector(_shipping) {
        this._shipping = _shipping;
    }
    ShippingSelector.prototype.isInitializing = function (methodId) {
        if (methodId && this._shipping.statuses.initializingMethod !== methodId) {
            return false;
        }
        return !!this._shipping.statuses.isInitializing;
    };
    ShippingSelector.prototype.getInitializeError = function (methodId) {
        if (methodId && this._shipping.errors.initializeMethod !== methodId) {
            return;
        }
        return this._shipping.errors.initializeError;
    };
    return ShippingSelector;
}());
exports.default = ShippingSelector;
//# sourceMappingURL=shipping-selector.js.map