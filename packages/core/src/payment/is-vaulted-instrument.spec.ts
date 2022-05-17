import isVaultedInstrument from './is-vaulted-instrument';
import { getCreditCardInstrument } from './payments.mock';

describe('isTokenizedCreditCardLike', () => {
    it('returns true if a Vaulted Instrument', () => {
        const paymentData = { instrumentId: 'my_instrument_id', cvv: 123, iin: '123123' };
        expect(isVaultedInstrument(paymentData)).toBeTruthy();
    });

    it('returns false if a Tokenized Credit Card', () => {
        const paymentData = { nonce: 'my_nonce', deviceSessionId: 'my_session_id' };
        expect(isVaultedInstrument(paymentData)).toBeFalsy();
    });

    it('returns false if the object looks like a credit creditcard', () => {
        const paymentData = getCreditCardInstrument();
        expect(isVaultedInstrument(paymentData)).toBeFalsy();
    });
});
