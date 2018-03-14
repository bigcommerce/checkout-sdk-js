"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var errors_1 = require("../../common/error/errors");
var OrderFinalizationNotRequiredError = (function (_super) {
    tslib_1.__extends(OrderFinalizationNotRequiredError, _super);
    function OrderFinalizationNotRequiredError() {
        var _this = _super.call(this, 'The current order does not need to be finalized at this stage.') || this;
        _this.type = 'order_finalization_not_required';
        return _this;
    }
    return OrderFinalizationNotRequiredError;
}(errors_1.StandardError));
exports.default = OrderFinalizationNotRequiredError;
//# sourceMappingURL=order-finalization-not-required-error.js.map