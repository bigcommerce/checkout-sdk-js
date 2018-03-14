"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
function omitDeep(object, predicate) {
    if (Array.isArray(object)) {
        return object.map(function (value) { return omitDeep(value, predicate); });
    }
    if (typeof object === 'object') {
        return lodash_1.transform(lodash_1.omitBy(object, predicate), function (result, value, key) {
            result[key] = omitDeep(value, predicate);
        }, {});
    }
    return object;
}
exports.default = omitDeep;
//# sourceMappingURL=omit-deep.js.map