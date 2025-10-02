import CartRetrievalError from './cart-retrieval-error';

describe('init', () => {
    it('sets type to cart_retrieval', () => {
        const error = new CartRetrievalError();

        expect(error.type).toBe('cart_retrieval');
    });

    it('returns error name', () => {
        const error = new CartRetrievalError();

        expect(error.name).toBe('CartRetrievalError');
    });

    it('sets the message as `body.title`', () => {
        const error = new CartRetrievalError('test message');

        expect(error.message).toBe('test message');
    });
});
