import CartConflictError from './cart-conflict-error';

describe('CartConflictError', () => {
    it('returns error name and type', () => {
        const error = new CartConflictError();

        expect(error.name).toBe('CartConflictError');
        expect(error.type).toBe('cart_conflict');
    });

    it('returns default message when no custom message is provided', () => {
        const error = new CartConflictError();

        expect(error.message).toBe(
            'Your checkout could not be processed because the cart has been modified. Please review your order and try again.',
        );
    });

    it('returns custom message when provided', () => {
        const customMessage = 'Custom cart conflict message';
        const error = new CartConflictError(customMessage);

        expect(error.message).toBe(customMessage);
        expect(error.name).toBe('CartConflictError');
        expect(error.type).toBe('cart_conflict');
    });
});
