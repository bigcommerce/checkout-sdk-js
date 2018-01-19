import deepFreeze from './deep-freeze';

describe('deepFreeze()', () => {
    it('throws error if mutating object', () => {
        const object = deepFreeze({ message: 'Foobar' });

        expect(() => { object.message = 'Hello'; }).toThrow();
        expect(() => { object.newMessage = 'Hello'; }).toThrow();
    });

    it('does not freeze the original object', () => {
        const object = { message: 'Foobar' };

        deepFreeze(object);
        expect(() => { object.message = 'Hello'; }).not.toThrow();
    });

    it('throws error if mutating array', () => {
        const array = deepFreeze(['Foobar']);

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
});
