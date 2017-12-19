"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodash_1 = require("lodash");
/**
 * Push an item to an array if it doesn't exist in the array. Otherwise, merge
 * with the existing item in the array. This function always returns a new array.
 *
 * @param {Array<T>} array
 * @param {T} item
 * @param {function(T): boolean|Object} predicate
 * @return {Array<T>}
 * @template T
 */
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