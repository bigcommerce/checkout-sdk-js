"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CacheKeyResolver = (function () {
    function CacheKeyResolver() {
        this._lastId = 0;
        this._maps = [];
    }
    CacheKeyResolver.prototype.getKey = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var _a = this._resolveMap.apply(this, args), index = _a.index, map = _a.map, parentMaps = _a.parentMaps;
        if (map) {
            map.usedCount++;
            return map.cacheKey;
        }
        return this._generateKey(parentMaps, args.slice(index));
    };
    CacheKeyResolver.prototype.getUsedCount = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var map = this._resolveMap.apply(this, args).map;
        return map ? map.usedCount : 0;
    };
    CacheKeyResolver.prototype._resolveMap = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var index = 0;
        var parentMaps = this._maps;
        while (parentMaps.length) {
            var isMatched = false;
            for (var _a = 0, parentMaps_1 = parentMaps; _a < parentMaps_1.length; _a++) {
                var map = parentMaps_1[_a];
                if (map.value !== args[index]) {
                    continue;
                }
                if ((args.length === 0 || index === args.length - 1) && map.cacheKey) {
                    return { index: index, map: map, parentMaps: parentMaps };
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
        return { index: index, parentMaps: parentMaps };
    };
    CacheKeyResolver.prototype._generateKey = function (maps, args) {
        var index = 0;
        var parentMaps = maps;
        var map;
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
        map.cacheKey = "" + ++this._lastId;
        return map.cacheKey;
    };
    return CacheKeyResolver;
}());
exports.default = CacheKeyResolver;
//# sourceMappingURL=cache-key-resolver.js.map