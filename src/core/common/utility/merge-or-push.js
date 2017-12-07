import { findIndex, isPlainObject } from 'lodash';

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
export default function mergeOrPush(array, item, predicate) {
    const index = findIndex(array, predicate);
    const newArray = [...array];

    if (index === -1) {
        newArray.push(item);
    } else {
        newArray[index] = isPlainObject(item) ? { ...array[index], ...item } : item;
    }

    return newArray;
}
