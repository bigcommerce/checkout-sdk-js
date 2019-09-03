import PaymentMethodNotAllowedError from './payment-method-not-allowed-error';

describe('PaymentMethodNotAllowedError', () => {
    it('returns error name', () => {
        const error = new PaymentMethodNotAllowedError();

        expect(error.name).toEqual('PaymentMethodNotAllowedError');
    });
});
