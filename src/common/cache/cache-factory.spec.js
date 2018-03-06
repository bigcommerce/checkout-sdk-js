import CacheFactory from './cache-factory';
import Cache from './cache';

describe('CacheFactory', () => {
    it('returns same cache instance if previously defined', () => {
        const factory = new CacheFactory();
        const cache = factory.get('foobar');

        expect(cache).toBeInstanceOf(Cache);
        expect(factory.get('foobar')).toBe(cache);
    });
});
