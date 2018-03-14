"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var errors_1 = require("../../common/error/errors");
var PaymentMethodUnsupportedError = (function (_super) {
    tslib_1.__extends(PaymentMethodUnsupportedError, _super);
    function PaymentMethodUnsupportedError(name) {
        var _this = _super.call(this, "Failed to proceed because \"" + name + "\" is not supported.") || this;
        _this.type = 'payment_method_unsupported';
        return _this;
    }
    return PaymentMethodUnsupportedError;
}(errors_1.StandardError));
exports.default = PaymentMethodUnsupportedError;
//# sourceMappingURL=payment-method-unsupported-error.js.map