"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
function getResponse(body, headers, status, statusText) {
    if (headers === void 0) { headers = {}; }
    if (status === void 0) { status = 200; }
    if (statusText === void 0) { statusText = 'OK'; }
    return {
        body: body,
        status: status,
        statusText: statusText,
        headers: tslib_1.__assign({ 'content-type': 'application/json' }, headers),
    };
}
exports.getResponse = getResponse;
function getErrorResponse(body, headers, status, statusText) {
    if (headers === void 0) { headers = {}; }
    if (status === void 0) { status = 400; }
    if (statusText === void 0) { statusText = 'Bad Request'; }
    return {
        body: body,
        status: status,
        statusText: statusText,
        headers: tslib_1.__assign({ 'content-type': 'application/json' }, headers),
    };
}
exports.getErrorResponse = getErrorResponse;
function getTimeoutResponse() {
    return {
        body: '',
        headers: {},
        status: 0,
        statusText: undefined,
    };
}
exports.getTimeoutResponse = getTimeoutResponse;
//# sourceMappingURL=responses.mock.js.map