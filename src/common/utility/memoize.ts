import { memoize as lodashMemoize } from 'lodash';

import CacheKeyResolver from './cache-key-resolver';

export default function memoize<T extends (...args: any[]) => any>(fn: T) {
    const resolver = new CacheKeyResolver();
    const memoized = lodashMemoize(fn, (...args) => resolver.getKey(...args));

    return memoized;
}
