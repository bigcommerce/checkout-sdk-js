import joinIncludes from './join-includes';
import mergeIncludes from './merge-includes';

/**
 * Joins or merges a base list of includes with a set of additional includes.
 */
export default function joinOrMergeIncludes<T extends string>(
    baseIncludes: T[],
    includeDictionaryOrList: { [key in T]?: boolean } | T[] = []
): string {
    return Array.isArray(includeDictionaryOrList) ?
        joinIncludes([
            ...baseIncludes,
            ...includeDictionaryOrList,
        ]) :
        mergeIncludes(baseIncludes, includeDictionaryOrList);
}
