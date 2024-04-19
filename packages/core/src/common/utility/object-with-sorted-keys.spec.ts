import objectWithSortedKeys from './object-with-sorted-keys';

const unsortedObject = {
    test: 'test',
    a: '1',
};

describe('objectFlatten()', () => {
    it('flattens a nested object', () => {
        const sortedObject = {
            a: '1',
            test: 'test',
        };

        const result = objectWithSortedKeys(unsortedObject);

        expect(result).toEqual(sortedObject);
    });
});
