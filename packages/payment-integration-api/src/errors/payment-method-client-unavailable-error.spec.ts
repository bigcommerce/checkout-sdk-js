import PaymentMethodClientUnavailableError from './payment-method-client-unavailable-error';

describe('PaymentMethodClientUnavailableError', () => {
    it('returns error name', () => {
        const error = new PaymentMethodClientUnavailableError();

        expect(error.name).toEqual('PaymentMethodClientUnavailableError');
    });

    it('returns error type', () => {
        const error = new PaymentMethodClientUnavailableError();

        expect(error.type).toEqual('payment_method_client_unavailable');
    });

    it('returns error default message', () => {
        const error = new PaymentMethodClientUnavailableError();

        expect(error.message).toEqual('Unable to proceed because the client library of a payment method is not loaded or ready to be used.');
    });

    it('returns error custom message', () => {
        const error = new PaymentMethodClientUnavailableError('This is a custom error message');

        expect(error.message).toEqual('This is a custom error message');
    });
});
