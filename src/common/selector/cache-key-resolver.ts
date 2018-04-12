export default class CacheKeyResolver {
    private _lastId = 0;
    private _maps: CacheKeyMap[] = [];

    getKey(...args: any[]): string {
        const { index, map, parentMaps } = this._resolveMap(...args);

        if (map && map.cacheKey) {
            map.usedCount++;

            return map.cacheKey;
        }

        return this._generateKey(parentMaps, args.slice(index));
    }

    getUsedCount(...args: any[]): number {
        const { map } = this._resolveMap(...args);

        return map ? map.usedCount : 0;
    }

    private _resolveMap(...args: any[]): ResolveResult {
        let index = 0;
        let parentMaps = this._maps;

        while (parentMaps.length) {
            let isMatched = false;

            for (const map of parentMaps) {
                if (map.value !== args[index]) {
                    continue;
                }

                if ((args.length === 0 || index === args.length - 1) && map.cacheKey) {
                    return { index, map, parentMaps };
                }

                isMatched = true;
                parentMaps = map.maps;
                index++;

                break;
            }

            if (!isMatched) {
                break;
            }
        }

        return { index, parentMaps };
    }

    private _generateKey(maps: CacheKeyMap[], args: any[]): string {
        let index = 0;
        let parentMaps = maps;
        let map!: CacheKeyMap;

        do {
            map = {
                usedCount: 1,
                value: args[index],
                maps: [],
            };

            parentMaps.push(map);

            parentMaps = map.maps;
            index++;
        } while (index < args.length);

        map.cacheKey = `${++this._lastId}`;

        return map.cacheKey;
    }
}

interface CacheKeyMap {
    maps: CacheKeyMap[];
    value: any;
    usedCount: number;
    cacheKey?: string;
}

interface ResolveResult {
    index: number;
    parentMaps: CacheKeyMap[];
    map?: CacheKeyMap;
}
