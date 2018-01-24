"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
function deepFreeze(object) {
    if (Object.isFrozen(object) || (!Array.isArray(object) && !lodash_1.isPlainObject(object))) {
        return object;
    }
    if (Array.isArray(object)) {
        return Object.freeze(object.map(function (value) { return deepFreeze(value); }));
    }
    return Object.freeze(Object.getOwnPropertyNames(object).reduce(function (result, key) {
        result[key] = deepFreeze(object[key]);
        return result;
    }, {}));
}
exports.default = deepFreeze;
//# sourceMappingURL=deep-freeze.js.map