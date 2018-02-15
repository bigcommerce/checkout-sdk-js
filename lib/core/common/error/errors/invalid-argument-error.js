"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var standard_error_1 = require("./standard-error");
var InvalidArgumentError = (function (_super) {
    tslib_1.__extends(InvalidArgumentError, _super);
    function InvalidArgumentError(message) {
        var _this = _super.call(this, message || 'Invalid arguments have been provided.') || this;
        _this.type = 'invalid_argument';
        return _this;
    }
    return InvalidArgumentError;
}(standard_error_1.default));
exports.default = InvalidArgumentError;
//# sourceMappingURL=invalid-argument-error.js.map