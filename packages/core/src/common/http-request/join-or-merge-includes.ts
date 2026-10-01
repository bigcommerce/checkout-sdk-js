import joinIncludes from './join-includes';
import mergeIncludes from './merge-includes';

/**
 * Joins or merges a base list of includes with a set of additional includes.
 */
export default function joinOrMergeIncludes<T extends string>(
    baseIncludes: T[],
    // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
    includeDictionaryOrList: { [key in T]?: boolean } | T[] = [],
): string {
    return Array.isArray(includeDictionaryOrList)
        ? joinIncludes([...baseIncludes, ...includeDictionaryOrList])
        : mergeIncludes(baseIncludes, includeDictionaryOrList);
}
