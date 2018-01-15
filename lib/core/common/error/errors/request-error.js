"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var standard_error_1 = require("./standard-error");
var RequestError = (function (_super) {
    tslib_1.__extends(RequestError, _super);
    function RequestError(_a, message) {
        var _b = _a.body, body = _b === void 0 ? {} : _b, headers = _a.headers, status = _a.status, statusText = _a.statusText;
        var _this = _super.call(this, joinErrors(body.errors) || body.detail || body.title || message || 'An unexpected error has occurred.') || this;
        _this.type = 'request';
        _this.body = body;
        _this.headers = headers;
        _this.status = status;
        _this.statusText = statusText;
        return _this;
    }
    return RequestError;
}(standard_error_1.default));
exports.default = RequestError;
function joinErrors(errors) {
    if (!Array.isArray(errors)) {
        return;
    }
    return errors.map(function (error) {
        return typeof error === 'object' ? error.message : error;
    }).join(' ');
}
//# sourceMappingURL=request-error.js.map