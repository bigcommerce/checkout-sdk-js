import PaymentMethodDeclinedError from './payment-method-declined-error';

describe('PaymentMethodDeclinedError', () => {
    it('returns error name', () => {
        const error = new PaymentMethodDeclinedError();

        expect(error.name).toEqual('PaymentMethodDeclinedError');
    });
});
