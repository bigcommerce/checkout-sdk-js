import { memoize } from '@bigcommerce/memoize';

import { bindDecorator, isEqual, isPrivate, CacheKeyResolver } from '../utility';

/**
 * Decorates a class by patching all of its methods to cache their return values
 * and return them if they are called again with the same set of parameters. The
 * decorator also binds all the methods to the calling instance so it can be
 * destructed.
 */
export default function selectorDecorator<T extends Constructor<object>>(target: T): T {
    const decoratedTarget = class extends target {};

    Object.getOwnPropertyNames(target.prototype)
        .forEach(key => {
            const descriptor = Object.getOwnPropertyDescriptor(target.prototype, key);

            if (!descriptor || key === 'constructor') {
                return;
            }

            Object.defineProperty(
                decoratedTarget.prototype,
                key,
                selectorMethodDecorator(target.prototype, key, descriptor)
            );
        });

    return decoratedTarget;
}

function selectorMethodDecorator<T extends Method>(target: object, key: string, descriptor: TypedPropertyDescriptor<T>): TypedPropertyDescriptor<T> {
    if (typeof descriptor.value !== 'function') {
        return descriptor;
    }

    let resolver = new CacheKeyResolver();
    let method = descriptor.value;
    let memoizedMethod = memoize(method);

    return bindDecorator(target, key, {
        get() {
            const value = ((...args: any[]) => {
                const cachedValue = memoizedMethod.call(this, ...args);

                if (resolver.getUsedCount(...args) === 1) {
                    return cachedValue;
                }

                const newValue = method.call(this, ...args);

                if (isEqual(newValue, cachedValue, { keyFilter: key => !isPrivate(key) })) {
                    return cachedValue;
                }

                memoizedMethod.cache.set(resolver.getKey(...args), newValue);

                return newValue;
            }) as T;

            Object.defineProperty(this, key, { ...descriptor, value });

            return value;
        },
        set(value) {
            resolver = new CacheKeyResolver();
            method = value;
            memoizedMethod = memoize(method);
        },
    });
}

export type Constructor<T> = new (...args: any[]) => T;
type Method = (...args: any[]) => any;
