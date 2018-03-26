import { isEqual } from 'lodash';
import * as memoize from 'memoizee';

import { bindDecorator } from '../utility';

/**
 * Decorates a class by patching all of its methods to cache their return values
 * and return them if they are called again with the same set of parameters. The
 * decorator also binds all the methods to the calling instance so it can be
 * destructed.
 */
export default function selectorDecorator<T extends Constructor<object>>(target: T): T {
    const decoratedTarget = class extends target {};

    Object.getOwnPropertyNames(target.prototype)
        .forEach((key) => {
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

    let method = descriptor.value;
    let memoizedMethod = memoize(method, { length: false });

    return bindDecorator(target, key, {
        get() {
            const value = ((...args: any[]) => {
                const newValue = method.call(this, ...args);
                const cachedValue = memoizedMethod.call(this, ...args);

                if (isEqual(newValue, cachedValue)) {
                    return cachedValue;
                }

                return newValue;
            }) as T;

            Object.defineProperty(this, key, { ...descriptor, value });

            return value;
        },
        set(value) {
            method = value;
            memoizedMethod = memoize(method, { length: false });
        },
    });
}

export type Constructor<T> = new (...args: any[]) => T;
type Method = (...args: any[]) => any;
