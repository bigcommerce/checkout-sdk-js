import CacheKeyResolver from './cache-key-resolver';

describe('CacheKeyResolver', () => {
    it('returns same cache key if params are equal', () => {
        const resolver = new CacheKeyResolver();

        expect(resolver.getKey('hello')).toEqual('1');
        expect(resolver.getKey('bye')).toEqual('2');
        expect(resolver.getKey('hello')).toEqual('1');
        expect(resolver.getKey('bye')).toEqual('2');
    });

    it('returns same cache key if multiple params are equal', () => {
        const resolver = new CacheKeyResolver();

        expect(resolver.getKey('hello', 'world')).toEqual('1');
        expect(resolver.getKey('hello', 'good', 'bye')).toEqual('2');
        expect(resolver.getKey('hello', 'world')).toEqual('1');
        expect(resolver.getKey('hello', 'good', 'bye')).toEqual('2');
    });

    it('returns same cache key if no params are provided', () => {
        const resolver = new CacheKeyResolver();

        expect(resolver.getKey()).toEqual('1');
        expect(resolver.getKey()).toEqual('1');
    });

    it('works with non-primitive params', () => {
        const resolver = new CacheKeyResolver();
        const personA = { name: 'Foo' };
        const personB = { name: 'Bar' };
        const personC = { name: 'Foobar' };

        expect(resolver.getKey(personA, personB)).toEqual('1');
        expect(resolver.getKey(personB, personA)).toEqual('2');
        expect(resolver.getKey(personA, personB)).toEqual('1');
        expect(resolver.getKey(personB, personA, personC)).toEqual('3');
    });

    it('returns cache key used count', () => {
        const resolver = new CacheKeyResolver();

        expect(resolver.getUsedCount('hello', 'world')).toEqual(0);
        resolver.getKey('hello', 'world');
        expect(resolver.getUsedCount('hello', 'world')).toEqual(1);
        resolver.getKey('hello', 'world');
        expect(resolver.getUsedCount('hello', 'world')).toEqual(2);
    });
});
