"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var request_error_1 = require("./request-error");
var UnrecoverableError = (function (_super) {
    tslib_1.__extends(UnrecoverableError, _super);
    function UnrecoverableError(response, message) {
        var _this = _super.call(this, response, message || 'An unexpected error has occurred. The checkout process cannot continue as a result.') || this;
        _this.type = 'unrecoverable';
        return _this;
    }
    return UnrecoverableError;
}(request_error_1.default));
exports.default = UnrecoverableError;
//# sourceMappingURL=unrecoverable-error.js.map