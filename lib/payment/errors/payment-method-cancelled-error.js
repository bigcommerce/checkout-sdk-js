"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var errors_1 = require("../../common/error/errors");
var PaymentMethodCancelledError = (function (_super) {
    tslib_1.__extends(PaymentMethodCancelledError, _super);
    function PaymentMethodCancelledError() {
        var _this = _super.call(this, 'Payment process was cancelled.') || this;
        _this.type = 'payment_cancelled';
        return _this;
    }
    return PaymentMethodCancelledError;
}(errors_1.StandardError));
exports.default = PaymentMethodCancelledError;
//# sourceMappingURL=payment-method-cancelled-error.js.map