export default function toSingleLine(input?: string) {
    if (!input) {
        return '';
    }

    return input.split(/(?:\r\n|\n|\r)/)
        .map(line => line.replace(/^\s+/gm, ''))
        .join(' ')
        .trim();
}
