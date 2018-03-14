"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var errors_1 = require("../../common/error/errors");
var RemoteCheckoutPaymentError = (function (_super) {
    tslib_1.__extends(RemoteCheckoutPaymentError, _super);
    function RemoteCheckoutPaymentError(error) {
        var _this = _super.call(this, 'There was an error retrieving your remote payment method. Please try again.') || this;
        _this.type = 'remote_checkout_payment';
        _this.error = error;
        return _this;
    }
    return RemoteCheckoutPaymentError;
}(errors_1.StandardError));
exports.default = RemoteCheckoutPaymentError;
//# sourceMappingURL=remote-checkout-payment-error.js.map