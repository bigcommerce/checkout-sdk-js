"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var errors_1 = require("../../common/error/errors");
var RemoteCheckoutShippingError = (function (_super) {
    tslib_1.__extends(RemoteCheckoutShippingError, _super);
    function RemoteCheckoutShippingError(error) {
        var _this = _super.call(this, 'There was an error retrieving your remote shipping address. Please try again.') || this;
        _this.type = 'remote_checkout_shipping';
        _this.error = error;
        return _this;
    }
    return RemoteCheckoutShippingError;
}(errors_1.StandardError));
exports.default = RemoteCheckoutShippingError;
//# sourceMappingURL=remote-checkout-shipping-error.js.map