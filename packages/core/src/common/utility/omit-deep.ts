import { isPlainObject, omitBy, transform } from 'lodash';

export default function omitDeep(object: any, predicate: (value: any, key: string) => boolean): any {
    if (Array.isArray(object)) {
        return object.map(value => omitDeep(value, predicate));
    }

    if (isPlainObject(object)) {
        return transform(omitBy(object, predicate), (result, value, key) => {
            result[key] = omitDeep(value, predicate);
        }, {} as { [key: string]: any });
    }

    return object;
}
