import omitDeep from './omit-deep';

describe('omitDeep()', () => {
    it('omits nested properties', () => {
        const object = {
            $$key: 'abc',
            id: 1,
            items: [
                { $$key: 'abc', id: 2 },
                { $$key: 'abc', id: 3 },
            ],
        };

        const expected = {
            id: 1,
            items: [
                { id: 2 },
                { id: 3 },
            ],
        };

        expect(omitDeep(object, (_, key) => key === '$$key')).toEqual(expected);
    });
});
