"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var errors_1 = require("../../common/error/errors");
var RemoteCheckoutSynchronizationError = (function (_super) {
    tslib_1.__extends(RemoteCheckoutSynchronizationError, _super);
    function RemoteCheckoutSynchronizationError(error) {
        var _this = _super.call(this, 'Unable to synchronize your checkout details with a third party provider. Please try again later.') || this;
        _this.type = 'remote_checkout_synchronization';
        _this.error = error;
        return _this;
    }
    return RemoteCheckoutSynchronizationError;
}(errors_1.StandardError));
exports.default = RemoteCheckoutSynchronizationError;
//# sourceMappingURL=remote-checkout-synchronization-error.js.map