import { deepFreeze } from '@bigcommerce/data-store';

// tslint:disable-next-line:ban-types
type FunctionProperties<T> = { [K in keyof T]: T[K] extends Function ? T[K] : never };

export default function createFreezeProxy<T extends object>(target: T): T {
    return createProxy(target, (target, name) =>
        (...args: any[]) => deepFreeze(target[name].call(target, ...args))
    );
}

export function createFreezeProxies<T extends object, TMap extends { [key: string]: T }>(map: TMap): TMap {
    return Object.keys(map)
        .reduce((result, key) => {
            result[key] = createFreezeProxy(map[key]);

            return result;
        }, {} as { [key: string]: T }) as TMap;
}

function createProxy<T extends object>(target: T, trap: (target: FunctionProperties<T>, name: keyof FunctionProperties<T>, proxy: T) => any): T {
    const proxy = Object.create(target);

    traversePrototypeOf(target, prototype => {
        Object.getOwnPropertyNames(prototype)
            .forEach(name => {
                if (name === 'constructor' || typeof proxy[name] !== 'function' || name.charAt(0) === '_') {
                    return;
                }

                proxy[name] = trap(target as FunctionProperties<T>, name as keyof T, proxy);
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
