import { memoize as lodashMemoize } from 'lodash';
import * as shallowEqual from 'shallowequal';

import { Omit } from '../types';

import CacheKeyResolver from './cache-key-resolver';

export interface MemoizeOptions {
    maxSize?: number;
    isEqual?(valueA: any, valueB: any): boolean;
}

export default function memoize<T extends (...args: any[]) => any>(
    fn: T,
    options?: MemoizeOptions
) {
    const { maxSize, isEqual } = { maxSize: 0, isEqual: shallowEqual, ...options };
    const cache = new Map();
    const resolver = new CacheKeyResolver({
        maxSize,
        isEqual,
        onExpire: key => cache.delete(key),
    });
    const memoized = lodashMemoize(fn, (...args) => resolver.getKey(...args));

    memoized.cache = cache;

    return memoized;
}

export function memoizeOne<T extends (...args: any[]) => any>(
    fn: T,
    options?: Omit<MemoizeOptions, 'maxSize'>
) {
    return memoize(fn, { ...options, maxSize: 1 });
}
