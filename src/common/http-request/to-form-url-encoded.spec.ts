import { toFormUrlEncoded } from './';

describe('toFormUrlEncoded()', () => {
    it('encodes the given object to formUrlEncoded', () => {
        const object = {
            A: 'A',
            B: 'B',
        };
        const expected = 'A=A&B=B';
        expect(toFormUrlEncoded(object)).toEqual(expected);
    });
});
