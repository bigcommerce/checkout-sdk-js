/**
 * @param {Object} object
 * @param {Object} prototype
 */
export default function setPrototypeOf(object, prototype) {
    if (Object.setPrototypeOf) {
        Object.setPrototypeOf(object, prototype);
    } else {
        // eslint-disable-next-line no-proto
        object.__proto__ = prototype;
    }

    return object;
}
