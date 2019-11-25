import { noop } from 'lodash';
import shallowEqual from 'shallowequal';

import { isRootCacheKeyMap, isTerminalCacheKeyMap, ChildCacheKeyMap, IntermediateCacheKeyMap, RootCacheKeyMap, TerminalCacheKeyMap } from './cache-key-maps';

export interface CacheKeyResolverOptions {
    maxSize?: number;
    onExpire?(key: string): void;
    isEqual?(valueA: any, valueB: any): boolean;
}

interface ResolveResult {
    index: number;
    parentMap: RootCacheKeyMap | IntermediateCacheKeyMap;
    map?: TerminalCacheKeyMap;
}

export default class CacheKeyResolver {
    private _lastId = 0;
    private _map: RootCacheKeyMap = { maps: [] };
    private _usedMaps: TerminalCacheKeyMap[] = [];
    private _options: Required<CacheKeyResolverOptions>;

    constructor(options?: CacheKeyResolverOptions) {
        this._options = {
            maxSize: 0,
            isEqual: shallowEqual,
            onExpire: noop,
            ...options,
        };
    }

    getKey(...args: any[]): string {
        const result = this._resolveMap(...args);
        const { index, parentMap } = result;
        let { map } = result;

        if (map && map.cacheKey) {
            map.usedCount++;
        } else {
            map = this._generateMap(parentMap, args.slice(index));
        }

        // Keep track of the least used map so we can remove it if the size of
        // the stack exceeds the maximum size.
        this._removeLeastUsedMap(map);

        return map.cacheKey;
    }

    getUsedCount(...args: any[]): number {
        const { map } = this._resolveMap(...args);

        return map ? map.usedCount : 0;
    }

    private _resolveMap(...args: any[]): ResolveResult {
        let index = 0;
        let parentMap = this._map;

        // Traverse the tree to find the linked list of maps that match the
        // arguments of the call. Each intermediate or terminal map contains a
        // value that could be used to match with the arguments. The last map in
        // the list (the terminal) should contain a cache key. If it can does
        // not exist, we will return a falsy value so that the caller could
        // handle and generate a new cache key.
        while (parentMap.maps.length) {
            let isMatched = false;

            for (let mapIndex = 0; mapIndex < parentMap.maps.length; mapIndex++) {
                const map = parentMap.maps[mapIndex];

                if (!this._options.isEqual(map.value, args[index])) {
                    continue;
                }

                // Move the most recently used map to the top of the stack for
                // quicker access
                parentMap.maps.unshift(...parentMap.maps.splice(mapIndex, 1));

                if ((args.length === 0 || index === args.length - 1) && isTerminalCacheKeyMap(map)) {
                    return { index, map, parentMap };
                }

                isMatched = true;
                parentMap = map;
                index++;

                break;
            }

            if (!isMatched) {
                break;
            }
        }

        return { index, parentMap };
    }

    private _generateMap(parent: RootCacheKeyMap | IntermediateCacheKeyMap, args: any[]): TerminalCacheKeyMap {
        let index = 0;
        let parentMap = parent;
        let map: IntermediateCacheKeyMap;

        do {
            map = {
                maps: [],
                parentMap,
                usedCount: 1,
                value: args[index],
            };

            // Continue to build the tree of maps so that it could be resolved
            // next time when the function is called with the same set of
            // arguments.
            parentMap.maps.unshift(map);

            parentMap = map;
            index++;
        } while (index < args.length);

        const terminalMap = map as TerminalCacheKeyMap;

        terminalMap.cacheKey = `${++this._lastId}`;

        return terminalMap;
    }

    private _removeLeastUsedMap(recentlyUsedMap: TerminalCacheKeyMap): void {
        if (!this._options.maxSize) {
            return;
        }

        const index = this._usedMaps.indexOf(recentlyUsedMap);

        this._usedMaps.splice(
            index === -1 ? 0 : index,
            index === -1 ? 0 : 1,
            recentlyUsedMap
        );

        if (this._usedMaps.length <= this._options.maxSize) {
            return;
        }

        const map = this._usedMaps.pop();

        if (!map) {
            return;
        }

        this._removeMap(map);
        this._options.onExpire(map.cacheKey);
    }

    private _removeMap(map: ChildCacheKeyMap): void {
        if (!map.parentMap) {
            return;
        }

        map.parentMap.maps.splice(map.parentMap.maps.indexOf(map), 1);

        if (isRootCacheKeyMap(map.parentMap)) {
            return;
        }

        this._removeMap(map.parentMap);
    }
}
