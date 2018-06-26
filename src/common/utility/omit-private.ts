import isPrivate from './is-private';
import omitDeep from './omit-deep';

export default function omitPrivate(object: any): any {
    return omitDeep(object, (value: any, key: string) => isPrivate(key));
}
