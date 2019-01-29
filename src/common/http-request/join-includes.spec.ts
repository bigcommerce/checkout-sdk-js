import joinIncludes from './join-includes';

describe('joinIncludes()', () => {
    it('joins include params using comma as separator', () => {
        expect(joinIncludes(['foo', 'bar', 'hello-world']))
            .toEqual('foo,bar,hello-world');
    });

    it('returns string without duplicates', () => {
        expect(joinIncludes(['foo', 'bar', 'foo']))
            .toEqual('foo,bar');
    });
});
