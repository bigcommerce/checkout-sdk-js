import PaymentMethodInvalidError from './payment-method-invalid-error';

describe('PaymentMethodInvalidError', () => {
    it('returns error name', () => {
        const error = new PaymentMethodInvalidError();

        expect(error.name).toEqual('PaymentMethodInvalidError');
    });
});
