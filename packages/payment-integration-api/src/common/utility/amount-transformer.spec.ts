import AmountTransformer from './amount-transformer';

describe('AmountTransformer', () => {
    it('converts decimal into integer', () => {
        expect(new AmountTransformer(2).toInteger(1.234)).toBe(123);

        expect(new AmountTransformer(2).toInteger(-1.234)).toEqual(-123);

        expect(new AmountTransformer(0).toInteger(1.234)).toBe(1);
    });

    it('handles cases where conversion might produce imprecise number', () => {
        // 894.9999999999999
        expect(new AmountTransformer(2).toInteger(8.95)).toBe(895);

        // 896.0000000000001
        expect(new AmountTransformer(2).toInteger(8.96)).toBe(896);
    });
});
