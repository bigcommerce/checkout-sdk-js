export default function isPrivate(key: string): boolean {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-template-expression
    return `${key}`.startsWith('$$') || `${key}`.startsWith('_');
}
