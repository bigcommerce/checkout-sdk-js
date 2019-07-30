import { isArray } from 'lodash';

import arrayReplace from './array-replace';
import isPlainObject from './is-plain-object';
import objectSet from './object-set';

export default function objectMerge<T extends object>(currentObject: T, newObject?: Partial<T>): T;
export default function objectMerge<T extends object>(currentObject: T | undefined, newObject: Partial<T>): Partial<T>;
export default function objectMerge<T extends object>(currentObject?: T, newObject?: Partial<T>): T | undefined;
export default function objectMerge<T extends object>(currentObject?: T, newObject?: Partial<T>): T | Partial<T> | undefined {
    if (!currentObject) {
        return newObject;
    }

    // If the new object does not exist but the current object does, or the new
    // object is strictly equal to the current object, return the current object
    if (!newObject || currentObject === newObject) {
        return currentObject;
    }

    // If both objects exist, but some values might be different, perform a merge.
    // Retain values that are equal and only replace them with the new values if
    // they are different.
    return (Object.keys(newObject) as Array<keyof T>)
        .reduce((result, key) => {
            const currentValue = result[key];
            const newValue = newObject[key];

            if (isPlainObject(currentValue) && isPlainObject(newValue)) {
                return objectSet(result, key, objectMerge(currentValue, newValue));
            }

            if (isArray(currentValue) && isArray(newValue)) {
                return objectSet(result, key, arrayReplace(currentValue, newValue) as any);
            }

            return objectSet(result, key, newValue as any);
        }, currentObject);
}
