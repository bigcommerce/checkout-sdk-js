import EmptyCartError from './empty-cart-error';

describe('EmptyCartError', () => {
    it('returns error name and type', () => {
        const error = new EmptyCartError();

        expect(error.name).toBe('EmptyCartError');
        expect(error.type).toBe('empty_cart');
    });

    it('returns default message when no custom message is provided', () => {
        const error = new EmptyCartError();

        expect(error.message).toBe(
            'Your checkout could not be processed because your cart is empty. Please add items to your cart and try again.',
        );
    });

    it('returns custom message when provided', () => {
        const customMessage = 'Custom empty cart message';
        const error = new EmptyCartError(customMessage);

        expect(error.message).toBe(customMessage);
        expect(error.name).toBe('EmptyCartError');
        expect(error.type).toBe('empty_cart');
    });
});
