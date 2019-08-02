import objectSet from './object-set';

describe('objectSet()', () => {
    it('sets key of object with new value by creating new copy of object if current value is different to new value', () => {
        const object = { item: { id: 1 } };
        const newValue = { id: 2 };
        const result = objectSet(object, 'item', newValue);

        expect(result)
            .toEqual({ item: { id: 2 } });
        expect(result.item)
            .toBe(newValue);
    });

    it('retains current value if new value is same as current', () => {
        const object = { item: { id: 1 } };
        const newValue = object.item;
        const result = objectSet(object, 'item', newValue);

        expect(result)
            .toBe(object);
        expect(result.item)
            .toBe(object.item);
    });
});
