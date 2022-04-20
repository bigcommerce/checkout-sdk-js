import cloneResult from './clone-result';

describe('cloneResult()', () => {
    it('clones output of function', () => {
        const data = { message: 'foo' };
        const fn = () => data;
        const clonedFn = cloneResult(fn);

        expect(clonedFn())
            .toEqual(fn());

        expect(clonedFn())
            .not.toBe(fn());
    });

    it('only clones again if output is different to previous call', () => {
        let data = { message: 'foo' };
        const fn = () => data;
        const clonedFn = cloneResult(fn);
        const resultA = clonedFn();

        expect(resultA)
            .toBe(clonedFn());

        data = { message: 'bar' };

        expect(resultA)
            .not.toBe(clonedFn());
    });

    it('does not clone nested object again if it is already cloned', () => {
        let data = { message: 'foo', child: { id: 1 } };
        const fn = () => data;
        const clonedFn = cloneResult(fn);
        const resultA = clonedFn();

        data = { ...data, message: 'bar' };

        const resultB = clonedFn();

        expect(resultA.child)
            .toBe(resultB.child);

        expect(resultA.child)
            .not.toBe(fn().child);
    });
});
