import isCreditCardLike from './is-credit-card-like';
import { getPayment } from './payments.mock';

describe('isCreditCardLike', () => {
    it('returns true if the object looks like a credit creditcard', () => {
        const { paymentData } = getPayment();
        expect(isCreditCardLike(paymentData)).toBeTruthy();
    });

    it('returns false if a Vaulted Instrument', () => {
        const paymentData = { instrumentId: 'my_instrument_id', cvv: 123 };
        expect(isCreditCardLike(paymentData)).toBeFalsy();
    });

    it('returns false if a Tokenized Credit Card', () => {
        const paymentData = { nonce: 'my_nonce' };
        expect(isCreditCardLike(paymentData)).toBeFalsy();
    });
});
