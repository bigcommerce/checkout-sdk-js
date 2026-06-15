import PaymentOrderCreationError from './payment-order-intent-creation-error';

describe('PaymentOrderCreationError', () => {
    it('creates an error with default message when no message is provided', () => {
        const error = new PaymentOrderCreationError();

        expect(error.message).toBe(
            'An unexpected error has occurred during payment order creation process. Please try again later.',
        );
        expect(error.name).toBe('PaymentOrderCreationError');
        expect(error.type).toBe('payment_order_creation_error');
    });

    it('creates an error with a custom message', () => {
        const customMessage = 'Cart not found';
        const error = new PaymentOrderCreationError(customMessage);

        expect(error.message).toBe(customMessage);
        expect(error.name).toBe('PaymentOrderCreationError');
        expect(error.type).toBe('payment_order_creation_error');
    });
});
