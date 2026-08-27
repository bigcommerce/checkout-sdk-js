import PaymentMethodBankDeclinedAuthenticationError from './payment-method-bank-declined-authentication-error';

describe('PaymentMethodBankDeclinedAuthenticationError', () => {
    it('returns error name', () => {
        const error = new PaymentMethodBankDeclinedAuthenticationError();

        expect(error.name).toBe('PaymentMethodBankDeclinedAuthenticationError');
    });

    it('returns error type', () => {
        const error = new PaymentMethodBankDeclinedAuthenticationError();

        expect(error.type).toBe('bank_declined_authentication');
    });
});
