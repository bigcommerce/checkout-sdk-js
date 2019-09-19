/**
 * Decorates a class or a method by binding all its prototype methods or itself
 * to the calling instance respectively.
 */
export default function bindDecorator<T extends Method>(target: object, key: string, descriptor: TypedPropertyDescriptor<T>): TypedPropertyDescriptor<T>;
export default function bindDecorator<T extends Constructor<object>>(target: T): T;
export default function bindDecorator(target: any, key?: any, descriptor?: any): any {
    if (!key || !descriptor) {
        return bindClassDecorator(target);
    }

    return bindMethodDecorator(target, key, descriptor);
}

/**
 * Decorates a class by binding all its prototype methods to the calling
 * instance.
 */
export function bindClassDecorator<T extends Constructor<object>>(target: T): T {
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
                bindMethodDecorator(target.prototype, key, descriptor)
            );
        });

    return decoratedTarget;
}

/**
 * Decorates a method by binding it to the calling instance.
 */
export function bindMethodDecorator<T extends Method>(_: object, key: string, descriptor: TypedPropertyDescriptor<T>): TypedPropertyDescriptor<T> {
    if (typeof descriptor.value !== 'function') {
        return descriptor;
    }

    let method: T = descriptor.value;

    return {
        get() {
            const boundMethod = method.bind(this) as T;

            Object.defineProperty(this, key, {
                ...descriptor,
                value: boundMethod,
            });

            return boundMethod;
        },
        set(value) {
            method = value;
        },
    };
}

export type Constructor<T> = new (...args: any[]) => T;
export type Method = (...args: any[]) => any;
