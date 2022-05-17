import { memoize } from 'lodash';

import isPlainObject from './is-plain-object';

const cloneDeep = memoize(<T>(input: T): T => {
    if (Array.isArray(input)) {
        return input.map((value: T[keyof T]) => (
            cloneDeepSafe(value)
        )) as any;
    }

    if (isPlainObject(input)) {
        return (Object.keys(input) as Array<keyof T>)
            .reduce((result, key) => ({
                ...result,
                [key]: cloneDeepSafe(input[key]),
            }), {}) as T;
    }

    return input;
});

// Use WeakMap as the MapCache, this allows for better garbage collection
// There's a deprecated `clear` method in the lodash implementation
// of MapCache, hence the `any`
cloneDeep.cache = new WeakMap() as any;

/**
 * This is a wrapper function for `cloneDeep`. We need it because `cloneDeep` is
 * a memoized function using an instance of `WeakMap` as its cache. Without this
 * wrapper, the memoized function will throw an error if it is called with a
 * non-object argument.
 */
const cloneDeepSafe = <T>(input: T): T => {
    return typeof input === 'object' && input !== null ?
        cloneDeep(input) :
        input;
};

/**
 * Clone the return value of a function. If the result is the same as previous
 * calls, return the previous clone instead of cloning it again.
 */
export default function cloneResult<T extends Func>(fn: T): T {
    return ((...args: any[]) => cloneDeepSafe(fn(...args))) as T;
}

export type Func = (...args: any[]) => any;
