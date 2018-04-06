"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var standard_error_1 = require("./standard-error");
var DEFAULT_RESPONSE = {
    body: {},
    headers: {},
    status: 0,
    statusText: '',
};
var RequestError = (function (_super) {
    tslib_1.__extends(RequestError, _super);
    function RequestError(_a, message) {
        var _b = _a === void 0 ? DEFAULT_RESPONSE : _a, _c = _b.body, body = _c === void 0 ? {} : _c, headers = _b.headers, status = _b.status, statusText = _b.statusText;
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
    return errors.reduce(function (result, error) {
        if (typeof error === 'string') {
            return result.concat([error]);
        }
        if (error && error.message) {
            return result.concat([error.message]);
        }
        return result;
    }, []).join(' ');
}
//# sourceMappingURL=request-error.js.map