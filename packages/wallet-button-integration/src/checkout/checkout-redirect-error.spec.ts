import CheckoutRedirectError from './checkout-redirect-error';

describe('CheckoutRedirectError', () => {
    it('creates an error with default message when no message is provided', () => {
        const error = new CheckoutRedirectError();

        expect(error.message).toBe(
            'An unexpected error has occurred during checkout redirection process. Please try again later.',
        );
        expect(error.name).toBe('CheckoutRedirectError');
        expect(error.type).toBe('checkout_redirect_error');
    });

    it('creates an error with a custom message', () => {
        const customMessage = 'Cart not found';
        const error = new CheckoutRedirectError(customMessage);

        expect(error.message).toBe(customMessage);
        expect(error.name).toBe('CheckoutRedirectError');
        expect(error.type).toBe('checkout_redirect_error');
    });
});
