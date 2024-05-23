import { isPlainObject as lodashIsPlainObject } from 'lodash';

// We need this wrapper because Lodash's version doesn't act as a type guard
export default function isPlainObject(value: any): value is object {
    return lodashIsPlainObject(value);
}
