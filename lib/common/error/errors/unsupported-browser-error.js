"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var standard_error_1 = require("./standard-error");
var UnsupportedBrowserError = (function (_super) {
    tslib_1.__extends(UnsupportedBrowserError, _super);
    function UnsupportedBrowserError(message) {
        var _this = _super.call(this, message || 'Unsupported browser error') || this;
        _this.type = 'unsupported_browser';
        return _this;
    }
    return UnsupportedBrowserError;
}(standard_error_1.default));
exports.default = UnsupportedBrowserError;
//# sourceMappingURL=unsupported-browser-error.js.map