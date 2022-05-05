export interface RootCacheKeyMap {
    maps: ChildCacheKeyMap[];
}

export interface IntermediateCacheKeyMap {
    maps: ChildCacheKeyMap[];
    parentMap: RootCacheKeyMap | IntermediateCacheKeyMap;
    usedCount: number;
    value: any;
}

export interface TerminalCacheKeyMap extends IntermediateCacheKeyMap {
    cacheKey: string;
}

export type ChildCacheKeyMap = IntermediateCacheKeyMap | TerminalCacheKeyMap;

export function isTerminalCacheKeyMap(map: ChildCacheKeyMap): map is TerminalCacheKeyMap {
    return map.hasOwnProperty('cacheKey');
}

export function isRootCacheKeyMap(map: RootCacheKeyMap | ChildCacheKeyMap): map is RootCacheKeyMap {
    return map.hasOwnProperty('parentMap');
}
