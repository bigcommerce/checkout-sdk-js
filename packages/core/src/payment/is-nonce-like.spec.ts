import isNonceLike from './is-nonce-like';
import { getCreditCardInstrument } from './payments.mock';

describe('isNonceLike', () => {
    it('returns true if a Tokenized Credit Card', () => {
        const paymentData = { nonce: 'my_nonce', deviceSessionId: 'my_session_id' };
        expect(isNonceLike(paymentData)).toBeTruthy();
    });

    it('returns false if the object looks like a credit creditcard', () => {
        const paymentData = getCreditCardInstrument();
        expect(isNonceLike(paymentData)).toBeFalsy();
    });

    it('returns false if a Vaulted Instrument', () => {
        const paymentData = { instrumentId: 'my_instrument_id', cvv: 123, iin: '123123' };
        expect(isNonceLike(paymentData)).toBeFalsy();
    });
});
