import isCreditCardLike from './is-credit-card-like';

describe('isCreditCardLike', () => {
    it('returns true if the object looks like a credit creditcard', () => {
        const paymentData = {
            ccExpiry: {
                month: '10',
                year: '2020',
            },
            ccName: 'BigCommerce',
            ccNumber: '4111111111111111',
            ccCvv: '123',
        };

        expect(paymentData && isCreditCardLike(paymentData)).toBe(true);
    });

    it('returns false if a Vaulted Instrument', () => {
        const paymentData = { instrumentId: 'my_instrument_id', cvv: 123, iin: '123123' };

        expect(isCreditCardLike(paymentData)).toBe(false);
    });

    it('returns false if a Tokenized Credit Card', () => {
        const paymentData = { nonce: 'my_nonce' };

        expect(isCreditCardLike(paymentData)).toBe(false);
    });
});
