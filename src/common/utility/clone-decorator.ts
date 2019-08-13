import { cloneDeep, memoize } from 'lodash';

export default function cloneDecorator<T extends Method>(target: object, key: string, descriptor: TypedPropertyDescriptor<T>): TypedPropertyDescriptor<T>;
export default function cloneDecorator<T extends Constructor<object>>(target: T): T;
export default function cloneDecorator(target: any, key?: any, descriptor?: any): any {
    if (!key || !descriptor) {
        return cloneClassDecorator(target);
    }

    return cloneMethodDecorator(target, key, descriptor);
}

export function cloneClassDecorator<T extends Constructor<object>>(target: T): T {
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
                cloneMethodDecorator(target.prototype, key, descriptor)
            );
        });

    return decoratedTarget;
}

export function cloneMethodDecorator<T extends Method>(_: object, key: string, descriptor: TypedPropertyDescriptor<T>): TypedPropertyDescriptor<T> {
    if (typeof descriptor.value !== 'function') {
        return descriptor;
    }

    let method = descriptor.value;
    const memoizedCloneDeep = memoize(cloneDeep);

    // Use WeakMap as the MapCache, this allows for better garbage collection
    // There's a deprecated `clear` method in the lodash implementation
    // of MapCache, hence the `any`
    memoizedCloneDeep.cache = new WeakMap() as any;

    return {
        get() {
            const value = ((...args: any[]) => {
                const result = method.apply(this, args);

                return result && typeof result === 'object'
                    ? memoizedCloneDeep(result)
                    : result;
            }) as T;

            Object.defineProperty(this, key, { ...descriptor, value });

            return value;
        },
        set(value) {
            method = value;
        },
    };
}

export type Constructor<T> = new (...args: any[]) => T;
export type Method = (...args: any[]) => any;
