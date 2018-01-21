import { isPlainObject } from 'lodash';

export default function deepFreeze<T>(object: T[]): ReadonlyArray<T>;
export default function deepFreeze<T extends object>(object: T): Readonly<T>;
export default function deepFreeze<T>(object: T): T;
export default function deepFreeze<T>(object: T[] | T): ReadonlyArray<T> | Readonly<T> | T {
    if (Object.isFrozen(object) || (!Array.isArray(object) && !isPlainObject(object))) {
        return object;
    }

    if (Array.isArray(object)) {
        return Object.freeze(object.map((value) => deepFreeze(value)));
    }

    return Object.freeze(Object.getOwnPropertyNames(object).reduce((result, key) => {
        result[key as keyof T] = deepFreeze(object[key as keyof T]);

        return result;
    }, {} as T));
}
