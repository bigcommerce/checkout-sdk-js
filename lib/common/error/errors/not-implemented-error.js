"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var standard_error_1 = require("./standard-error");
var NotImplementedError = (function (_super) {
    tslib_1.__extends(NotImplementedError, _super);
    function NotImplementedError(message) {
        var _this = _super.call(this, message || 'Not implemented.') || this;
        _this.type = 'not_implemented';
        return _this;
    }
    return NotImplementedError;
}(standard_error_1.default));
exports.default = NotImplementedError;
//# sourceMappingURL=not-implemented-error.js.map