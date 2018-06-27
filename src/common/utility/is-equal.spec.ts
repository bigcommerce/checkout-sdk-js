import isEqual from './is-equal';
import isPrivate from './is-private';

describe('isEqual', () => {
    it('returns true if objects are same', () => {
        const object = { a: 'a', b: 'b' };

        expect(isEqual(object, object))
            .toEqual(true);
    });

    it('returns true if objects are equal in value', () => {
        const objectA = { a: 'a', b: 'b' };
        const objectB = { a: 'a', b: 'b' };

        expect(isEqual(objectA, objectB))
            .toEqual(true);
    });

    it('returns false if objects are different in value', () => {
        const objectA = { a: 'a', b: 'b' };
        const objectB = { a: 'A', b: 'B' };

        expect(isEqual(objectA, objectB))
            .toEqual(false);
    });

    it('returns true if objects are equal except ignored properties', () => {
        const objectA = { a: 'a', b: 'b', _c: 'c', d: [{ $$a: 'a' }] };
        const objectB = { a: 'a', b: 'b', d: [{}] };

        expect(isEqual(objectA, objectB, { keyFilter: key => !isPrivate(key) }))
            .toEqual(true);
    });

    it('returns true if arrays are equal in value', () => {
        const objectA = ['a', 'b'];
        const objectB = ['a', 'b'];

        expect(isEqual(objectA, objectB))
            .toEqual(true);
    });

    it('returns false if arrays are different in value', () => {
        const objectA = ['a', 'b'];
        const objectB = ['A', 'B'];

        expect(isEqual(objectA, objectB))
            .toEqual(false);
    });

    it('returns true if nested objects are equal in value', () => {
        const objectA = { a: 'a', b: 'b', c: [1, 2], d: { a: 'a', b: 'b' } };
        const objectB = { a: 'a', b: 'b', c: [1, 2], d: { a: 'a', b: 'b' } };

        expect(isEqual(objectA, objectB))
            .toEqual(true);
    });

    it('returns false if nested objects are different in value', () => {
        const objectA = { a: 'a', b: 'b', c: [1, 2], d: { a: 'a', b: 'b' } };
        const objectB = { a: 'a', b: 'b', c: [1, 2], d: { a: 'A', b: 'B' } };

        expect(isEqual(objectA, objectB))
            .toEqual(false);
    });
});
