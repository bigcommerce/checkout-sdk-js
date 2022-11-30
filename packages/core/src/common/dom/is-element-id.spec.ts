import isElementId from './is-element-id';

describe('isElementId()', () => {
    it('returns true if string is valid element ID', () => {
        expect(isElementId('foobar')).toBe(true);

        expect(isElementId('FOOBAR')).toBe(true);

        expect(isElementId('foo-bar')).toBe(true);
    });

    it('returns false if string is not valid element ID', () => {
        expect(isElementId('.foobar')).toBe(false);

        expect(isElementId('[foobar]')).toBe(false);

        expect(isElementId('#foobar')).toBe(false);
    });
});
