import mergeOrPush from './merge-or-push';

describe('mergeOrPush()', () => {
    it('replaces primitive value in target array if found in array', () => {
        const array = [1, 2, 3, 4, 5];
        const expected = [1, 2, 99, 4, 5];

        expect(mergeOrPush<number>(array, 99, value => value === 3)).toEqual(expected);
    });

    it('merges input object in target array if found in array', () => {
        const array = [{ id: 1, name: 'one' }, { id: 2, name: 'two' }, { id: 3, name: 'three' }];
        const expected = [{ id: 1, name: 'ONE' }, { id: 2, name: 'two' }, { id: 3, name: 'three' }];

        expect(mergeOrPush(array, { id: 1, name: 'ONE' }, { id: 1 })).toEqual(expected);
    });

    it('recursively merges input object in target array if found in array', () => {
        const array = [{ id: 1, item: { name: 'ONE', message: 'foobar' } }, { id: 2, item: { name: 'TWO', message: 'hello' } }];
        const expected = [{ id: 1, item: { name: 'FOO', message: 'foobar' } }, { id: 2, item: { name: 'TWO', message: 'hello' } }];

        expect(mergeOrPush(array, { id: 1, item: { name: 'FOO' } } as any, { id: 1 })).toEqual(expected);
    });

    it('replaces input array in target array if found in array', () => {
        const array = [[1], [1, 2], [1, 2, 3]];
        const expected = [[1], [99], [1, 2, 3]];

        expect(mergeOrPush(array, [99], item => item.length === 2)).toEqual(expected);
    });

    it('pushes primitive value to target array if not found in array', () => {
        const array = [1, 2, 3, 4, 5];
        const expected = [1, 2, 3, 4, 5, 99];

        expect(mergeOrPush(array, 99, value => value === 6)).toEqual(expected);
    });

    it('pushes input object to target array if not found in array', () => {
        const array = [{ id: 1, name: 'one' }, { id: 2, name: 'two' }, { id: 3, name: 'three' }];
        const expected = [{ id: 1, name: 'one' }, { id: 2, name: 'two' }, { id: 3, name: 'three' }, { id: 4, name: 'ONE' }];

        expect(mergeOrPush(array, { id: 4, name: 'ONE' }, { id: 4 })).toEqual(expected);
    });

    it('pushes input array to target array if not found in array', () => {
        const array = [[1], [1, 2], [1, 2, 3]];
        const expected = [[1], [1, 2], [1, 2, 3], [99, 98]];

        expect(mergeOrPush(array, [99, 98], item => item.length === 4)).toEqual(expected);
    });
});
