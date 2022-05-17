import PaymentInstrumentNotValidError from './payment-instrument-not-valid-error';

describe('PaymentMethodCancelledError', () => {
    it('returns error name', () => {
        const error = new PaymentInstrumentNotValidError();

        expect(error.name).toEqual('PaymentInstrumentNotValidError');
    });
});
