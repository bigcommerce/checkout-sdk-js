"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodash_1 = require("lodash");
function mergeOrPush(array, item, predicate) {
    var index = lodash_1.findIndex(array, predicate);
    var newArray = array.slice();
    if (index === -1) {
        newArray.push(item);
    }
    else {
        newArray[index] = lodash_1.isPlainObject(item) ? tslib_1.__assign({}, array[index], item) : item;
    }
    return newArray;
}
exports.default = mergeOrPush;
//# sourceMappingURL=merge-or-push.js.map