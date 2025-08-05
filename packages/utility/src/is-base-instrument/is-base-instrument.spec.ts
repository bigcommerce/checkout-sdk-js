import { BaseInstrument, isBaseInstrument } from './is-base-instrument';

describe('isBaseInstrument', () => {
    const validInstrument: BaseInstrument = {
        bigpayToken: 'abc123',
        defaultInstrument: true,
        provider: 'stripe',
        trustedShippingAddress: false,
        method: 'card',
        type: 'credit_card',
    };

    it('returns true for a valid BaseInstrument', () => {
        expect(isBaseInstrument(validInstrument)).toBe(true);
    });

    it('returns false for null input', () => {
        expect(isBaseInstrument(null)).toBe(false);
    });
});
