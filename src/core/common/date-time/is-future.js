
/**
 * @param {Date} date
 * @return {Boolean}
 */
export default function isFuture(date) {
    return date.valueOf() > Date.now();
}
