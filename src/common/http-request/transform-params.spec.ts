import transformParams from './transform-params';

describe('transformParams()', () => {
    it('transforms `include` field from array into string', () => {
        const output = transformParams({ include: ['foo', 'bar'] });

        expect(output).toEqual({ include: 'foo,bar' });
    });

    it('does not transform `include` field if it is already string', () => {
        const output = transformParams({ include: 'foo,bar' });

        expect(output).toEqual({ include: 'foo,bar' });
    });

    it('returns undefined if nothing is passed', () => {
        const output = transformParams();

        expect(output).toBeUndefined();
    });
});
