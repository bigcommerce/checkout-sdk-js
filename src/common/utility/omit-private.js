import omitDeep from './omit-deep';

/**
 * @param {Object} object
 * @return {Object}
 */
export default function omitPrivate(object) {
    return omitDeep(object, (value, key) =>
        `${key}`.indexOf('$$') === 0 || `${key}`.indexOf('_') === 0
    );
}
