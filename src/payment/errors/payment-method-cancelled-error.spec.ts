import PaymentMethodCancelledError from './payment-method-cancelled-error';

describe('PaymentMethodCancelledError', () => {
    it('returns error name', () => {
        const error = new PaymentMethodCancelledError();

        expect(error.name).toEqual('PaymentMethodCancelledError');
    });
});
