"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var standard_error_1 = require("./standard-error");
var TimeoutError = (function (_super) {
    tslib_1.__extends(TimeoutError, _super);
    function TimeoutError(response) {
        var _this = _super.call(this, 'The request has timed out or aborted.', response) || this;
        _this.type = 'timeout';
        return _this;
    }
    return TimeoutError;
}(standard_error_1.default));
exports.default = TimeoutError;
//# sourceMappingURL=timeout-error.js.map