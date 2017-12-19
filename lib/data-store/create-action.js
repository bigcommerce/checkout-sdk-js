"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
/**
 * @param {string} type
 * @param {Object} [payload]
 * @param {Object} [meta]
 * @return {Action}
 */
function createAction(type, payload, meta) {
    if (typeof type !== 'string') {
        throw new Error('`type` must be a string');
    }
    return lodash_1.omitBy({
        type: type,
        payload: payload,
        meta: meta,
    }, function (value) { return value === undefined; });
}
exports.default = createAction;
//# sourceMappingURL=create-action.js.map