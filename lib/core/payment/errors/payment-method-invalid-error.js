"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var errors_1 = require("../../common/error/errors");
var PaymentMethodInvalidError = (function (_super) {
    tslib_1.__extends(PaymentMethodInvalidError, _super);
    function PaymentMethodInvalidError(response) {
        var _this = _super.call(this, response, 'There is a problem processing your payment. Please try again later.') || this;
        _this.type = 'payment_method_invalid';
        return _this;
    }
    return PaymentMethodInvalidError;
}(errors_1.RequestError));
exports.default = PaymentMethodInvalidError;
//# sourceMappingURL=payment-method-invalid-error.js.map