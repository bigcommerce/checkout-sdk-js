"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
/**
 * @param {ErrorResponseBody} [error]
 * @return {ErrorResponseBody}
 */
function getErrorResponseBody(error) {
    return tslib_1.__assign({ detail: 'Something went wrong', errors: ['Bad Request'], status: 400, title: 'Error' }, error);
}
exports.getErrorResponseBody = getErrorResponseBody;
//# sourceMappingURL=errors.mock.js.map