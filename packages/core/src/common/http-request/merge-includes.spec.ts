import mergeIncludes from './merge-includes';

describe('mergeIncludes()', () => {
    const baseIncludes: string[] = ['foo', 'bar'];

    it('returns base includes when dictionary is not provided', () => {
        expect(mergeIncludes(baseIncludes)).toBe('foo,bar');
    });

    it('appends includes that are turned on in the dictionary', () => {
        expect(mergeIncludes(baseIncludes, { hello: true, world: true })).toBe(
            'foo,bar,hello,world',
        );
    });

    it('removes base includes that are turned off in the dictionary', () => {
        expect(mergeIncludes(baseIncludes, { bar: false })).toBe('foo');
    });

    it('does not duplicate base includes that are turned on in the dictionary', () => {
        expect(mergeIncludes(baseIncludes, { bar: true })).toBe('foo,bar');
    });

    it('applies additions and deletions from the same dictionary', () => {
        expect(mergeIncludes(baseIncludes, { foo: false, hello: true })).toBe('bar,hello');
    });
});
