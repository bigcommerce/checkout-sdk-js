"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var utility_1 = require("../../utility");
var StandardError = (function (_super) {
    tslib_1.__extends(StandardError, _super);
    function StandardError(message) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, message || 'An unexpected error has occurred.') || this;
        _this.type = 'standard';
        utility_1.setPrototypeOf(_this, _newTarget.prototype);
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(_this, _newTarget);
        }
        else {
            _this.stack = (new Error(_this.message)).stack;
        }
        return _this;
    }
    return StandardError;
}(Error));
exports.default = StandardError;
//# sourceMappingURL=standard-error.js.map