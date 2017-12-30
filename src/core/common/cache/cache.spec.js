import Cache from './cache';

describe('Cache', () => {
    it('returns cached value if available', () => {
        const getter = jest.fn((firstName, lastName) => `Hello ${firstName} ${lastName}`);
        const cache = new Cache(getter);

        expect(cache.retrieve('Foo', 'Bar')).toEqual('Hello Foo Bar');
        expect(cache.retrieve('Foo', 'Bar')).toEqual('Hello Foo Bar');
        expect(getter).toHaveBeenCalledTimes(1);
    });

    it('recomputes if arguments are different', () => {
        const getter = jest.fn((firstName, lastName) => `Hello ${firstName} ${lastName}`);
        const cache = new Cache(getter);

        expect(cache.retrieve('Foo', 'Bar')).toEqual('Hello Foo Bar');
        expect(cache.retrieve('Rainbow', 'Unicorn')).toEqual('Hello Rainbow Unicorn');
        expect(getter).toHaveBeenCalledTimes(2);
    });

    it('recomputes with new getter only if arguments are different', () => {
        const cache = new Cache((firstName, lastName) => `Hello ${firstName} ${lastName}`);

        expect(cache.retrieve('Foo', 'Bar')).toEqual('Hello Foo Bar');

        cache.retain((firstName, lastName) => `Bye ${firstName} ${lastName}`);

        expect(cache.retrieve('Foo', 'Bar')).toEqual('Hello Foo Bar');
        expect(cache.retrieve('Rainbow', 'Unicorn')).toEqual('Bye Rainbow Unicorn');
    });
});
