import { isBaseInstrument } from './is-base-instrument';
import type { BaseInstrument } from '../../../payment-integration-api/src/payment/instrument';

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

    it('returns false if any required property is missing', () => {
        const missingField = {
            ...validInstrument,
        };
        delete (missingField as Partial<BaseInstrument>).method;

        expect(isBaseInstrument(missingField)).toBe(false);
    });

    it('returns false for null input', () => {
        expect(isBaseInstrument(null)).toBe(false);
    });
});
