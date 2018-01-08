import { deepFreeze } from '../../../data-store';

/**
 * @param {T} target
 * @return {T}
 * @template T
 */
export default function createFreezeProxy(target) {
    return createProxy(target, (target, name) =>
        (...args) => deepFreeze(target[name].call(target, ...args))
    );
}

/**
 * @private
 * @param {T} target
 * @return {T}
 * @template T
 */
function createProxy(target, trap) {
    const proxy = Object.create(target);

    traversePrototypeOf(target, (prototype) => {
        Object.getOwnPropertyNames(prototype)
            .forEach((name) => {
                if (name === 'constructor' || typeof proxy[name] !== 'function' || name.charAt(0) === '_') {
                    return;
                }

                proxy[name] = trap(target, name, proxy);
            });
    });

    return proxy;
}

/**
 * @private
 * @param {Object} target
 * @param {function(prototype: Object)} iteratee
 * @return {void}
 */
function traversePrototypeOf(target, iteratee) {
    let prototype = Object.getPrototypeOf(target);

    while (prototype) {
        iteratee(prototype);

        prototype = Object.getPrototypeOf(prototype);
    }
}
