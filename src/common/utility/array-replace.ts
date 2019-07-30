import { isArray } from 'lodash';

import isPlainObject from './is-plain-object';
import objectMerge from './object-merge';
import replace from './replace';

export interface ArrayReplaceOptions {
    matchObject(objectA: any, objectB: any): boolean;
}

export default function arrayReplace<T>(currentArray: T[] | undefined, newArray: T[], options?: ArrayReplaceOptions): T[];
export default function arrayReplace<T>(currentArray: T[], newArray?: T[], options?: ArrayReplaceOptions): undefined;
export default function arrayReplace<T>(currentArray?: T[], newArray?: T[], options?: ArrayReplaceOptions): T[] | undefined;
export default function arrayReplace<T>(currentArray?: T[], newArray?: T[], options?: ArrayReplaceOptions): T[] | undefined {
    const { matchObject = (a: any, b: any) => a.id === b.id } = options || {};

    if (!currentArray) {
        return newArray;
    }

    // If the new array does not exist, or the current array is strictly equal
    // to the new array, exit early and return the current array so that the
    // object reference doesn't change
    if (!newArray || currentArray === newArray) {
        return currentArray;
    }

    // Otherwise, try to replace the items of the current array with the new
    // array. If the item from the two arrays are the same, keep the current
    // one. Do it recursively until all arrays are replaced.
    let newItemCount = 0;

    const countNewItem = <T>(replacedValue: T, currentValue: T, newValue: T): T => {
        newItemCount += replacedValue === newValue && replacedValue !== currentValue ? 1 : 0;

        return replacedValue;
    };

    const result = newArray.map((newItem, index) => {
        const currentItem = currentArray && currentArray[index];

        if (isPlainObject(currentItem) && isPlainObject(newItem)) {
            if (matchObject(currentItem, newItem)) {
                return countNewItem(
                    objectMerge(currentItem, newItem),
                    currentItem,
                    newItem
                );
            }

            return countNewItem(
                replace(currentItem, newItem),
                currentItem,
                newItem
            );
        }

        if (isArray(currentItem) && isArray(newItem)) {
            return countNewItem(
                arrayReplace(currentItem, newItem),
                currentItem,
                newItem
            );
        }

        return countNewItem(
            replace(currentItem, newItem),
            currentItem,
            newItem
        );
    }) as T[];

    if (newItemCount === 0 && (currentArray && currentArray.length === newArray.length)) {
        return currentArray;
    }

    if (newItemCount === newArray.length) {
        return newArray;
    }

    return result;
}
