import CacheKeyResolver from './cache-key-resolver';

describe('CacheKeyResolver', () => {
    it('returns same cache key if params are equal', () => {
        const resolver = new CacheKeyResolver();

        expect(resolver.getKey('hello')).toBe('1');
        expect(resolver.getKey('bye')).toBe('2');
        expect(resolver.getKey('hello')).toBe('1');
        expect(resolver.getKey('bye')).toBe('2');
    });

    it('returns same cache key if multiple params are equal', () => {
        const resolver = new CacheKeyResolver();

        expect(resolver.getKey('hello', 'world')).toBe('1');
        expect(resolver.getKey('hello', 'good', 'bye')).toBe('2');
        expect(resolver.getKey('hello', 'world')).toBe('1');
        expect(resolver.getKey('hello', 'good', 'bye')).toBe('2');
    });

    it('returns same cache key if no params are provided', () => {
        const resolver = new CacheKeyResolver();

        expect(resolver.getKey()).toBe('1');
        expect(resolver.getKey()).toBe('1');
    });

    it('works with non-primitive params', () => {
        const resolver = new CacheKeyResolver();
        const personA = { name: 'Foo' };
        const personB = { name: 'Bar' };
        const personC = { name: 'Foobar' };

        expect(resolver.getKey(personA, personB)).toBe('1');
        expect(resolver.getKey(personB, personA)).toBe('2');
        expect(resolver.getKey(personA, personB)).toBe('1');
        expect(resolver.getKey(personB, personA, personC)).toBe('3');
    });

    it('works with functions', () => {
        const resolver = new CacheKeyResolver();
        const functionA = () => 'a';
        const functionB = () => 'b';

        expect(resolver.getKey('foobar', functionA)).toBe('1');
        expect(resolver.getKey('foobar', functionB)).toBe('2');
        expect(resolver.getKey('foobar', functionA)).toBe('1');
        expect(resolver.getKey('foobar', functionB)).toBe('2');
    });

    it('works with unserializable objects with cyclical reference', () => {
        const resolver = new CacheKeyResolver();
        const objectB: any = { child: undefined };
        const objectA: any = { child: objectB };

        objectB.child = objectA;

        expect(resolver.getKey(objectA, objectB)).toBe('1');
        expect(resolver.getKey(objectA, objectB)).toBe('1');
    });

    it('returns same key if objects are shallowly equivalent', () => {
        const resolver = new CacheKeyResolver();
        const objectA = { id: 1 };
        const objectB = { id: 1 };

        expect(resolver.getKey('foobar', objectA)).toEqual(resolver.getKey('foobar', objectB));
    });

    it('returns different cache key for least recently used set of arguments', () => {
        const resolver = new CacheKeyResolver({ maxSize: 2 });

        expect(resolver.getKey('hello', 'world')).toBe('1');
        // This will return the cache key
        expect(resolver.getKey('hello', 'world')).toBe('1');
        expect(resolver.getKey('hello', 'good')).toBe('2');
        expect(resolver.getKey('bad', 'guys')).toBe('3');
        // This will return a new cache key because the set of arguments is
        // least recently used and the number of cache keys already exceed the
        // maximum size
        expect(resolver.getKey('hello', 'world')).toBe('4');
    });

    it('only expires cache key if number of unique calls exceeds limit', () => {
        const resolver = new CacheKeyResolver({ maxSize: 2 });

        expect(resolver.getKey('hello', 'world')).toBe('1');
        expect(resolver.getKey('hello', 'world')).toBe('1');
        // The previous call should not expire the key because it is called with
        // the same set of arguments
        expect(resolver.getKey('hello', 'world')).toBe('1');

        expect(resolver.getKey('foo', 'bar')).toBe('2');
        expect(resolver.getKey('hello', 'bye')).toBe('3');

        // This call should return a new key because the previous two calls are
        // made with different sets of arguments
        expect(resolver.getKey('hello', 'world')).toBe('4');
    });

    it('returns cache key used count', () => {
        const resolver = new CacheKeyResolver();

        expect(resolver.getUsedCount('hello', 'world')).toBe(0);

        resolver.getKey('hello', 'world');

        expect(resolver.getUsedCount('hello', 'world')).toBe(1);

        resolver.getKey('hello', 'world');

        expect(resolver.getUsedCount('hello', 'world')).toBe(2);
    });
});
