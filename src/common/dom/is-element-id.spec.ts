import isElementId from './is-element-id';

describe('isElementId()', () => {
    it('returns true if string is valid element ID', () => {
        expect(isElementId('foobar'))
            .toEqual(true);

        expect(isElementId('FOOBAR'))
            .toEqual(true);

        expect(isElementId('foo-bar'))
            .toEqual(true);
    });

    it('returns false if string is not valid element ID', () => {
        expect(isElementId('.foobar'))
            .toEqual(false);

        expect(isElementId('[foobar]'))
            .toEqual(false);

        expect(isElementId('#foobar'))
            .toEqual(false);
    });
});
