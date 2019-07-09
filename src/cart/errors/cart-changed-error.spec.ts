import CartChangedError from './cart-changed-error';

describe('CartChangedError', () => {
    it('returns error name', () => {
        const error = new CartChangedError();

        expect(error.name).toEqual('CartChangedError');
    });
});
