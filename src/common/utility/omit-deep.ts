import { omitBy, transform } from 'lodash';

export default function omitDeep(object: any, predicate: (value: any, key: string) => boolean): any {
    if (Array.isArray(object)) {
        return object.map((value) => omitDeep(value, predicate));
    }

    if (typeof object === 'object') {
        return transform(omitBy(object, predicate), (result, value, key) => {
            result[key] = omitDeep(value, predicate);
        }, {});
    }

    return object;
}
