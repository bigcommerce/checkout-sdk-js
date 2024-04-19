import isVaultedInstrument from './is-vaulted-instrument';
import { CreditCardInstrument } from './payment';

describe('isTokenizedCreditCardLike', () => {
    it('returns true if a Vaulted Instrument', () => {
        const paymentData = { instrumentId: 'my_instrument_id', cvv: 123, iin: '123123' };

        expect(isVaultedInstrument(paymentData)).toBe(true);
    });

    it('returns false if a Tokenized Credit Card', () => {
        const paymentData = { nonce: 'my_nonce', deviceSessionId: 'my_session_id' };

        expect(isVaultedInstrument(paymentData)).toBe(false);
    });

    it('returns false if the object looks like a credit creditcard', () => {
        const paymentData: CreditCardInstrument = {
            ccExpiry: {
                month: '10',
                year: '2020',
            },
            ccName: 'BigCommerce',
            ccNumber: '4111111111111111',
            ccCvv: '123',
        };

        expect(isVaultedInstrument(paymentData)).toBe(false);
    });
});
