export default function toSingleLine(input: string) {
    return input.split(/(?:\r\n|\n|\r)/)
        .map(line => line.replace(/^\s+/gm, ''))
        .join(' ')
        .trim();
}
