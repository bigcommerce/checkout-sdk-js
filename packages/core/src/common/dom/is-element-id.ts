export default function isElementId(id: string): boolean {
    return /^\w[\w\-\:\.]*$/.test(id);
}
