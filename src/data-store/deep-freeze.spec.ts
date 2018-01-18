import deepFreeze from './deep-freeze';

describe('deepFreeze()', () => {
    it('throws error if mutating object', () => {
        // Cast as `any` to bypass `Readonly` constraint.
        const object = deepFreeze({ message: 'Foobar' }) as any;

        expect(() => { object.message = 'Hello'; }).toThrow();
        expect(() => { object.newMessage = 'Hello'; }).toThrow();
    });

    it('does not freeze the original object', () => {
        const object = { message: 'Foobar' };

        deepFreeze(object);
        expect(() => { object.message = 'Hello'; }).not.toThrow();
    });

    it('throws error if mutating array', () => {
        // Cast as `any` to bypass `ReadonlyArray` constraint.
        const array = deepFreeze(['Foobar']) as any;

        expect(() => { array[0] = 'Hello'; }).toThrow();
        expect(() => { array.push('Hello'); }).toThrow();
    });

    it('does not freeze the original array', () => {
        const array = ['Foobar'];

        deepFreeze(array);
        expect(() => { array.push('Hello'); }).not.toThrow();
    });

    it('throws error if mutating nested objects', () => {
        const object = deepFreeze({ child: { message: 'Foobar' } });
        const collection = deepFreeze([{ message: 'Foobar' }]);

        expect(() => { object.child.message = 'Hello'; }).toThrow();
        expect(() => { collection[0].message = 'Hello'; }).toThrow();
    });

    it('does not freeze primitive values', () => {
        const value = 'Foobar';

        expect(deepFreeze(value)).toBe(value);
    });

    it('does not freeze complex types', () => {
        class Foobar {}
        const object = new Foobar();

        expect(deepFreeze(object)).toBe(object);
    });
});
