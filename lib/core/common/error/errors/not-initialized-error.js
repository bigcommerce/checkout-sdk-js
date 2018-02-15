"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var standard_error_1 = require("./standard-error");
var NotInitializedError = (function (_super) {
    tslib_1.__extends(NotInitializedError, _super);
    function NotInitializedError(message) {
        var _this = _super.call(this, message || 'Not initialized.') || this;
        _this.type = 'not_initialized';
        return _this;
    }
    return NotInitializedError;
}(standard_error_1.default));
exports.default = NotInitializedError;
//# sourceMappingURL=not-initialized-error.js.map