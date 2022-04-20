import PaymentArgumentInvalidError from './payment-argument-invalid-error';

describe('PaymentArgumentInvalidError', () => {
    it('returns error name', () => {
        const error = new PaymentArgumentInvalidError();

        expect(error.name).toEqual('PaymentArgumentInvalidError');
    });
});
