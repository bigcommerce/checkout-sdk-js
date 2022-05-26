/* eslint-disable no-useless-escape */
export default function isElementId(id: string): boolean {
    return /^\w[\w\-\:\.]*$/.test(id);
}
