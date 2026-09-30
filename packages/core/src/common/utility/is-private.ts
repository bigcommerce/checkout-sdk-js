export default function isPrivate(key: string): boolean {
    return `${key}`.startsWith('$$') || `${key}`.startsWith('_');
}
