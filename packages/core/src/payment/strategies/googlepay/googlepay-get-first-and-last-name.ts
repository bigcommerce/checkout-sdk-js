export function getFirstAndLastName(fullName: string): [string, string] {
    const nameParts = fullName.split(' ');

    if (nameParts.length === 1) {
        return [fullName, ''];
    }

    const firstName = nameParts.slice(0, -1).join(' ');
    const lastName = nameParts[nameParts.length - 1];

    return [firstName, lastName];
}
