import omitPrivate from './omit-private';

describe('omitPrivate()', () => {
    it('omits private properties recursively', () => {
        const object = {
            $$key: 'abc',
            _key: 'abc',
            id: 1,
            items: [
                { $$key: 'abc', id: 2 },
                { _key: 'abc', id: 3 },
            ],
        };

        const expected = {
            id: 1,
            items: [
                { id: 2 },
                { id: 3 },
            ],
        };

        expect(omitPrivate(object)).toEqual(expected);
    });
});
