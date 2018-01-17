/**
 * @param {Date} date
 * @param {number} amount
 * @return {Date}
 */
export default function addMinutes(date, amount) {
    const newDate = new Date(date.getTime());

    newDate.setMinutes(date.getMinutes() + amount);

    return newDate;
}
