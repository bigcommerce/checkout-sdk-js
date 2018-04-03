import { deepFreeze } from '@bigcommerce/data-store';

export default function createFreezeProxy<T extends object>(target: T): T {
    return createProxy(target, (target, name) =>
        (...args: any[]) => deepFreeze(target[name].call(target, ...args))
    );
}

function createProxy<T extends object>(target: T, trap: (target: T, name: keyof T, proxy: T) => any): T {
    const proxy = Object.create(target);

    traversePrototypeOf(target, (prototype) => {
        Object.getOwnPropertyNames(prototype)
            .forEach((name) => {
                if (name === 'constructor' || typeof proxy[name] !== 'function' || name.charAt(0) === '_') {
                    return;
                }

                proxy[name] = trap(target, name as keyof T, proxy);
            });
    });

    return proxy;
}

function traversePrototypeOf(target: object, iteratee: (prototype: object) => void): void {
    let prototype = Object.getPrototypeOf(target);

    while (prototype) {
        iteratee(prototype);

        prototype = Object.getPrototypeOf(prototype);
    }
}
