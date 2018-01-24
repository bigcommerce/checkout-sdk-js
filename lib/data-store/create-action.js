"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodash_1 = require("lodash");
function createAction(type, payload, meta) {
    if (typeof type !== 'string' || type === '') {
        throw new Error('`type` must be a string');
    }
    return tslib_1.__assign({ type: type }, lodash_1.omitBy({ payload: payload, meta: meta }, function (value) { return value === undefined; }));
}
exports.default = createAction;
//# sourceMappingURL=create-action.js.map