export interface CompareOptions {
    keyFilter?(key: string): boolean;
}

export default function isEqual(objectA: any, objectB: any, options?: CompareOptions): boolean {
    if (objectA === objectB) {
        return true;
    }

    if (objectA && objectB && typeof objectA === 'object' && typeof objectB === 'object') {
        if (Array.isArray(objectA) && Array.isArray(objectB)) {
            return isArrayEqual(objectA, objectB, options);
        }

        if (Array.isArray(objectA) || Array.isArray(objectB)) {
            return false;
        }

        if ((objectA instanceof Date) && (objectB instanceof Date)) {
            return isDateEqual(objectA, objectB);
        }

        if ((objectA instanceof Date) || (objectB instanceof Date)) {
            return false;
        }

        if ((objectA instanceof RegExp) && (objectB instanceof RegExp)) {
            return isRegExpEqual(objectA, objectB);
        }

        if ((objectA instanceof RegExp) || (objectB instanceof RegExp)) {
            return false;
        }

        return isObjectEqual(objectA, objectB, options);
    }

    return objectA === objectB;
}

function isRegExpEqual(objectA: RegExp, objectB: RegExp): boolean {
    return objectA.toString() === objectB.toString();
}

function isDateEqual(objectA: Date, objectB: Date): boolean {
    return objectA.getTime() === objectB.getTime();
}

function isArrayEqual(objectA: any[], objectB: any[], options?: CompareOptions): boolean {
    if (objectA.length !== objectB.length) {
        return false;
    }

    for (let index = 0, length = objectA.length; index < length; index++) {
        if (!isEqual(objectA[index], objectB[index], options)) {
            return false;
        }
    }

    return true;
}

function isObjectEqual(
    objectA: { [key: string]: any },
    objectB: { [key: string]: any },
    options?: CompareOptions
): boolean {
    const filter = options && options.keyFilter;
    const keysA = filter ? Object.keys(objectA).filter(filter) : Object.keys(objectA);
    const keysB = filter ? Object.keys(objectB).filter(filter) : Object.keys(objectB);

    if (keysA.length !== keysB.length) {
        return false;
    }

    for (let index = 0, length = keysA.length; index < length; index++) {
        const key = keysA[index];

        if (!objectB.hasOwnProperty(key)) {
            return false;
        }

        if (!isEqual(objectA[key], objectB[key], options)) {
            return false;
        }
    }

    return true;
}
