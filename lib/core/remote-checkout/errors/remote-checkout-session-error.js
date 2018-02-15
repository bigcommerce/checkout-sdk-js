"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var errors_1 = require("../../common/error/errors");
var RemoteCheckoutSessionError = (function (_super) {
    tslib_1.__extends(RemoteCheckoutSessionError, _super);
    function RemoteCheckoutSessionError(error) {
        var _this = _super.call(this, 'Your remote session has expired. Please log in again.') || this;
        _this.type = 'remote_checkout_session';
        _this.error = error;
        return _this;
    }
    return RemoteCheckoutSessionError;
}(errors_1.StandardError));
exports.default = RemoteCheckoutSessionError;
//# sourceMappingURL=remote-checkout-session-error.js.map