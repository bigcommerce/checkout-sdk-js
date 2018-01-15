"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var errors_1 = require("../../common/error/errors");
var PaymentMethodUninitializedError = (function (_super) {
    tslib_1.__extends(PaymentMethodUninitializedError, _super);
    function PaymentMethodUninitializedError(name) {
        var _this = _super.call(this, "Failed to proceed because \"" + name + "\" has not been initialized.") || this;
        _this.type = 'payment_method_uninitialized';
        return _this;
    }
    return PaymentMethodUninitializedError;
}(errors_1.StandardError));
exports.default = PaymentMethodUninitializedError;
//# sourceMappingURL=payment-method-uninitialized-error.js.map