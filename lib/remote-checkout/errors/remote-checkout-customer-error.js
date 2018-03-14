"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var errors_1 = require("../../common/error/errors");
var RemoteCheckoutCustomerError = (function (_super) {
    tslib_1.__extends(RemoteCheckoutCustomerError, _super);
    function RemoteCheckoutCustomerError(error) {
        var _this = _super.call(this, 'There was an error retrieving your remote customer method. Please try again.') || this;
        _this.type = 'remote_checkout_customer';
        _this.error = error;
        return _this;
    }
    return RemoteCheckoutCustomerError;
}(errors_1.StandardError));
exports.default = RemoteCheckoutCustomerError;
//# sourceMappingURL=remote-checkout-customer-error.js.map