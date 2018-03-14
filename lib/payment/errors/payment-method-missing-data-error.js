"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var errors_1 = require("../../common/error/errors");
var PaymentMethodMissingDataError = (function (_super) {
    tslib_1.__extends(PaymentMethodMissingDataError, _super);
    function PaymentMethodMissingDataError(field) {
        var _this = _super.call(this, "Failed to proceed because payment method misses \"" + field + "\" data") || this;
        _this.type = 'payment_method_missing_data';
        return _this;
    }
    return PaymentMethodMissingDataError;
}(errors_1.StandardError));
exports.default = PaymentMethodMissingDataError;
//# sourceMappingURL=payment-method-missing-data-error.js.map