import isEqual from './is-equal';

/**
 * Set a new value to an object under a key if the new value is different to the
 * current value of the key.
 */
export default function objectSet<T extends { [key: string]: any }, K extends keyof T>(
    object: T | undefined,
    key: K,
    value: T[K]
): T {
    if (object && object.hasOwnProperty(key) && isEqual(object[key], value)) {
        return object;
    }

    return {
        ...object as any,
        [key]: value,
    };
}
