import { omitBy, transform } from 'lodash';

/**
 * @param {any} object
 * @param {function} predicate
 * @return {any}
 */
export default function omitDeep(object, predicate) {
    if (Array.isArray(object)) {
        return object.map(value => omitDeep(value, predicate));
    }

    if (typeof object === 'object') {
        return transform(omitBy(object, predicate), (result, value, key) => {
            result[key] = omitDeep(value, predicate);
        }, {});
    }

    return object;
}
