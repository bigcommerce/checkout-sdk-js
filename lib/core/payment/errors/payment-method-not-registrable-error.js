"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var errors_1 = require("../../common/error/errors");
var PaymentMethodNotRegistrableError = (function (_super) {
    tslib_1.__extends(PaymentMethodNotRegistrableError, _super);
    function PaymentMethodNotRegistrableError(name) {
        var _this = _super.call(this, "Failed to register \"" + name + "\" as a payment strategy.") || this;
        _this.type = 'payment_method_not_registrable';
        return _this;
    }
    return PaymentMethodNotRegistrableError;
}(errors_1.StandardError));
exports.default = PaymentMethodNotRegistrableError;
//# sourceMappingURL=payment-method-not-registrable-error.js.map