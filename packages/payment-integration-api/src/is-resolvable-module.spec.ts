import isResolvableModule from './is-resolvable-module';

describe('isResolvableModule', () => {
    it('returns true if resolvable module', () => {
        expect(isResolvableModule({ resolveIds: [{ id: 'foo' }] })).toBe(true);
    });

    it('returns false if not resolvable module', () => {
        expect(isResolvableModule({ someOtherProperty: true })).toBe(false);
    });
});
