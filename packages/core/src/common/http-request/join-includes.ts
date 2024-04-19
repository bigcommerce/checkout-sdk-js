import { uniq } from 'lodash';

export default function joinIncludes<T>(includes: T[]): string {
    return uniq(includes).join(',');
}
