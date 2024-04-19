export default function isPrivate(key: string): boolean {
    return `${key}`.indexOf('$$') === 0 || `${key}`.indexOf('_') === 0;
}
