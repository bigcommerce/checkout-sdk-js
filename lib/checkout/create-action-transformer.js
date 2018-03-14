"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
function createActionTransformer(requestErrorFactory) {
    return function (action$) { return action$.catch(function (action) {
        if (action instanceof Error || action.payload instanceof Error) {
            throw action;
        }
        if (isResponse(action.payload)) {
            throw tslib_1.__assign({}, action, { payload: requestErrorFactory.createError(action.payload) });
        }
        throw action;
    }); };
}
exports.default = createActionTransformer;
function isResponse(object) {
    if (!object || typeof object !== 'object') {
        return false;
    }
    return ['body', 'headers', 'status', 'statusText'].every(function (key) {
        return object.hasOwnProperty(key);
    });
}
//# sourceMappingURL=create-action-transformer.js.map