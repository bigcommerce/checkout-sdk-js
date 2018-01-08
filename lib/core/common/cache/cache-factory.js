"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cache_1 = require("./cache");
var CacheFactory = (function () {
    function CacheFactory() {
        this._caches = {};
    }
    CacheFactory.prototype.get = function (name) {
        var cache = this._caches[name];
        if (!cache) {
            cache = new cache_1.default();
            this._caches[name] = cache;
        }
        return cache;
    };
    return CacheFactory;
}());
exports.default = CacheFactory;
//# sourceMappingURL=cache-factory.js.map