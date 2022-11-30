import DigitalRiverError from './digitalriver-error';

describe('DigitalRiverError', () => {
    it('returns error name, type and message', () => {
        const error = new DigitalRiverError(
            'payment.digitalriver_checkout_error',
            'digitalRiverCheckoutError',
        );

        expect(error.name).toBe('digitalRiverCheckoutError');
        expect(error.type).toBe('payment.digitalriver_checkout_error');
        expect(error.message).toBe(
            'There was an error while processing your payment. Please try again or contact us.',
        );
    });
});
