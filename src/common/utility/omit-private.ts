import omitDeep from './omit-deep';

export default function omitPrivate(object: any): any {
    return omitDeep(object, (value: any, key: string) =>
        `${key}`.indexOf('$$') === 0 || `${key}`.indexOf('_') === 0
    );
}
