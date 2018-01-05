import Cache from './cache';

export default class CacheFactory {
    /**
     * @constructor
     */
    constructor() {
        this._caches = {};
    }

    /**
     * @param {string} name
     * @return {Cache}
     */
    get(name) {
        let cache = this._caches[name];

        if (!cache) {
            cache = new Cache();
            this._caches[name] = cache;
        }

        return cache;
    }
}
