import { assign, findIndex, isPlainObject, pickBy } from 'lodash';

import { PartialDeep } from '../types';

/**
 * Push an item to an array if it doesn't exist in the array. Otherwise, merge
 * with the existing item in the array. This function always returns a new array.
 */
export default function mergeOrPush<T extends object>(
    array: T[],
    item: T,
    predicate: ((item: T) => boolean) | PartialDeep<T>
): T[] {
    const index = findIndex(array, typeof predicate === 'object' ? pickBy(predicate) : predicate);
    const newArray = [...array];

    if (index === -1) {
        newArray.push(item);
    } else {
        newArray[index] = isPlainObject(item) ? assign({}, array[index], item) : item;
    }

    return newArray;
}
