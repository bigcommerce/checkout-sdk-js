"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var standard_error_1 = require("./standard-error");
var MissingDataError = (function (_super) {
    tslib_1.__extends(MissingDataError, _super);
    function MissingDataError(message) {
        var _this = _super.call(this, message || 'Unable to call this method because the data required for the call is not available. Please refer to the documentation to see what you need to do in order to obtain the required data.') || this;
        _this.type = 'missing_data';
        return _this;
    }
    return MissingDataError;
}(standard_error_1.default));
exports.default = MissingDataError;
//# sourceMappingURL=missing-data-error.js.map