"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var errors_1 = require("../../common/error/errors");
var RemoteCheckoutAccountInvalidError = (function (_super) {
    tslib_1.__extends(RemoteCheckoutAccountInvalidError, _super);
    function RemoteCheckoutAccountInvalidError(error) {
        var _this = _super.call(this, 'Please contact the seller for assistance or choose another checkout method.') || this;
        _this.type = 'remote_checkout_account_invalid';
        _this.error = error;
        return _this;
    }
    return RemoteCheckoutAccountInvalidError;
}(errors_1.StandardError));
exports.default = RemoteCheckoutAccountInvalidError;
//# sourceMappingURL=remote-checkout-account-invalid-error.js.map