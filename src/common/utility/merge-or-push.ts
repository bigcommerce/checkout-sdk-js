import { assign, findIndex, isPlainObject } from 'lodash';

/**
 * Push an item to an array if it doesn't exist in the array. Otherwise, merge
 * with the existing item in the array. This function always returns a new array.
 */
export default function mergeOrPush<T extends object>(array: T[], item: T, predicate: (item: T) => boolean): T[] {
    const index = findIndex(array, predicate);
    const newArray = [...array];

    if (index === -1) {
        newArray.push(item);
    } else {
        newArray[index] = isPlainObject(item) ? assign({}, array[index], item) : item;
    }

    return newArray;
}
