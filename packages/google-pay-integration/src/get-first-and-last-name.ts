/**
 * Splits the full name from a Google Pay address: the last word is the last name,
 * everything before it is the first name.
 */
export default function getFirstAndLastName(fullName = ''): [string, string] {
    const nameParts = fullName.trim().split(' ');

    if (nameParts.length === 1) {
        return [nameParts[0], ''];
    }

    return [nameParts.slice(0, -1).join(' '), nameParts[nameParts.length - 1]];
}
