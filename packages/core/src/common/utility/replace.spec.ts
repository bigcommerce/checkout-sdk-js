import replace from './replace';

describe('replace()', () => {
    it('replaces current value with new value if they are different', () => {
        const valueA = { message: 'foo' };
        const valueB = { message: 'bar' };

        expect(replace(valueA, valueB))
            .toBe(valueB);
    });

    it('retains current value if new value equals to current value but only differs in its reference', () => {
        const valueA = { message: 'foo' };
        const valueB = { message: 'foo' };

        expect(replace(valueA, valueB))
            .toBe(valueA);
    });

    it('replaces current value with empty value except `undefined`', () => {
        expect(replace('foobar', undefined))
            .toBe('foobar');

        expect(replace(Number(123), 0))
            .toBe(0);
        expect(replace(String('foobar'), ''))
            .toBe('');
        expect(replace(Object({ message: 'foo' }), null))
            .toBe(null);
    });
});
