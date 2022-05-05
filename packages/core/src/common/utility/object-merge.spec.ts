import objectMerge from './object-merge';

describe('objectMerge()', () => {
    it('retains current object if new object contains same set of values as current', () => {
        const object = { id: 1, message: 'foobar' };
        const result = objectMerge(object, { id: 1, message: 'foobar' });

        expect(result)
            .toBe(object);
    });

    it('recursively retains current object if new object contains same set of values as current', () => {
        const object = { item: { id: 1, message: 'foobar' } };
        const result = objectMerge(object, { item: { id: 1, message: 'foobar' } });

        expect(result)
            .toBe(object);
        expect(result.item)
            .toBe(object.item);
    });

    it('retains current object if new partial contains same set of values as current', () => {
        const object = { id: 1, message: 'foobar' };
        const result = objectMerge(object, { message: 'foobar' });

        expect(result)
            .toBe(object);
    });

    it('recursively retains current object if new partial contains same set of values as current', () => {
        const object = { item: { id: 1, message: 'foobar' } };
        const result = objectMerge(object, { item: { message: 'foobar' } } as any);

        expect(result)
            .toBe(object);
        expect(result.item)
            .toBe(object.item);
    });

    it('merges current object with new partial if they are different', () => {
        const object = { id: 1, message: 'foobar' };
        const newObject = { message: 'hello' };
        const result = objectMerge(object, newObject);

        expect(result)
            .not.toBe(object);
        expect(result)
            .not.toBe(newObject);
        expect(result)
            .toEqual({ id: 1, message: 'hello' });
    });

    it('recursively merges current object if new partial contains different set of values as current', () => {
        const object = { item: { id: 1, message: 'foobar' } };
        const newObject = { item: { message: 'hello' } };
        const result = objectMerge(object, newObject as any);

        expect(result)
            .not.toBe(object);
        expect(result)
            .not.toBe(newObject);
        expect(result)
            .toEqual({ item: { id: 1, message: 'hello' } });
    });
});
