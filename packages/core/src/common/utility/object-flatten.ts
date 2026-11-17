/**
 * Takes a nested object and flattens it.
 */
export default function objectFlatten(
    object: Record<string, any>,
    parent?: string,
): Record<string, any> {
    const flattened: Record<string, any> = {};

    Object.keys(object).forEach((key: string) => {
        const value = object[key];
        const keyString = parent ? `${parent}.${key}` : key;

        if (typeof value === 'object') {
            Object.assign(flattened, objectFlatten(value, keyString));
        } else {
            flattened[keyString] = value;
        }
    });

    return flattened;
}
