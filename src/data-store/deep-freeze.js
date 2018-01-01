import { isPlainObject } from 'lodash';

/**
 * @param {any} object
 * @return {any}
 */
export default function deepFreeze(object) {
    if (Object.isFrozen(object) || (!Array.isArray(object) && !isPlainObject(object))) {
        return object;
    }

    return Object.freeze(
        Object.getOwnPropertyNames(object)
            .reduce((result, key) => {
                result[key] = deepFreeze(object[key]);

                return result;
            }, Array.isArray(object) ? [] : {})
    );
}
