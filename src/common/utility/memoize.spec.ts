import memoize from './memoize';

describe('memoize', () => {
    it('only calls function again if parameters are different', () => {
        const add = jest.fn((a: number, b: number) => (a + b));
        const memoizedAdd = memoize(add);

        memoizedAdd(1, 1);
        memoizedAdd(1, 1);

        expect(add).toHaveBeenCalledTimes(1);

        memoizedAdd(2, 2);

        expect(add).toHaveBeenCalledTimes(2);
    });

    it('deletes cached result when key expires', () => {
        const add = jest.fn((a: number, b: number) => (a + b));
        const memoizedAdd = memoize(add, { maxSize: 1 });
        const cache = memoizedAdd.cache as Map<string, number>;

        memoizedAdd(1, 1);

        expect(cache.values().next().value)
            .toEqual(2);
        expect(Array.from(cache.values()).length)
            .toEqual(1);

        // This call should remove the previous result from the cache
        memoizedAdd(2, 2);

        expect(cache.values().next().value)
            .toEqual(4);
        expect(Array.from(cache.values()).length)
            .toEqual(1);
    });
});
