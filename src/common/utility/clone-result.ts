import { cloneDeep, memoize } from 'lodash';

const memoizedCloneDeep = memoize(cloneDeep);

// Use WeakMap as the MapCache, this allows for better garbage collection
// There's a deprecated `clear` method in the lodash implementation
// of MapCache, hence the `any`
memoizedCloneDeep.cache = new WeakMap() as any;

/**
 * Clone the return value of a function. If the result is the same as previous
 * calls, return the previous clone instead of cloning it again.
 */
export default function cloneResult<T extends Func>(fn: T): T {
    return ((...args: any[]) => {
        const result = fn(...args);

        return result && typeof result === 'object'
            ? memoizedCloneDeep(result)
            : result;
    }) as T;
}

export type Func = (...args: any[]) => any;
