"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RemoteCheckoutSelector = (function () {
    function RemoteCheckoutSelector(_remoteCheckout) {
        this._remoteCheckout = _remoteCheckout;
    }
    RemoteCheckoutSelector.prototype.getCheckout = function () {
        return this._remoteCheckout.data;
    };
    RemoteCheckoutSelector.prototype.getCheckoutMeta = function () {
        return this._remoteCheckout.meta;
    };
    return RemoteCheckoutSelector;
}());
exports.default = RemoteCheckoutSelector;
//# sourceMappingURL=remote-checkout-selector.js.map