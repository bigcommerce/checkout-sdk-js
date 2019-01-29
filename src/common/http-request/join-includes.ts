import { uniq } from 'lodash';

export default function joinIncludes(includes: string[]): string {
    return uniq(includes).join(',');
}
