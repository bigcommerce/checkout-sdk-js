import { kebabCase } from 'lodash';

export default function objectWithKebabCaseKeys(object: { [key: string]: any }) {
    const keys = Object.keys(object);

    return keys.reduce(
        (newObject, key) => ({
            ...newObject,
            [kebabCase(key)]: object[key],
        }),
        {},
    );
}
