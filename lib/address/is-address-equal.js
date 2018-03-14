"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodash_1 = require("lodash");
var utility_1 = require("../common/utility");
function isAddressEqual(addressA, addressB) {
    return lodash_1.isEqual(normalize(addressA), normalize(addressB));
}
exports.default = isAddressEqual;
function normalize(address) {
    var ignoredKeys = ['id', 'provinceCode'];
    return Object.keys(utility_1.omitPrivate(address) || {})
        .reduce(function (result, key) {
        return ignoredKeys.indexOf(key) === -1 && address[key] ? tslib_1.__assign({}, result, (_a = {}, _a[key] = address[key], _a)) :
            result;
        var _a;
    }, {});
}
//# sourceMappingURL=is-address-equal.js.map