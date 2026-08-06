import { difference, keys, pickBy } from 'lodash';

import joinIncludes from './join-includes';

/**
 * Merges includes given a list of base includes and a dictionary
 * of includes
 */
export default function mergeIncludes<T extends string>(
    baseIncludes: T[],
    includesDictionary?: { [key in T]?: boolean },
): string {
    const deletions = keys(pickBy(includesDictionary, (on) => !on));
    const additions = keys(pickBy(includesDictionary, (on) => on));

    return joinIncludes([...difference(baseIncludes, deletions), ...additions]);
}
