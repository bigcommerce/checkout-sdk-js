import isCreditCardInstrumentLike from './is-credit-card-instrument-like';

describe('isCreditCardInstrumentLike', () => {
    it('returns true for valid CreditCardInstrument-like object', () => {
        const validInstrument: unknown = {
            ccNumber: '4111111111111111',
            ccName: 'John Doe',
            ccExpiry: {
                month: '12',
                year: '2030',
            },
        };

        expect(isCreditCardInstrumentLike(validInstrument)).toBe(true);
    });

    it('returns false if ccNumber is missing', () => {
        const invalidInstrument: unknown = {
            ccName: 'John Doe',
            ccExpiry: {
                month: '12',
                year: '2030',
            },
        };

        expect(isCreditCardInstrumentLike(invalidInstrument)).toBe(false);
    });

    it('returns false if ccExpiry is not an object', () => {
        const invalidInstrument: unknown = {
            ccNumber: '4111111111111111',
            ccName: 'John Doe',
            ccExpiry: '12/2030',
        };

        expect(isCreditCardInstrumentLike(invalidInstrument)).toBe(false);
    });

    it('returns false for null input', () => {
        expect(isCreditCardInstrumentLike(null)).toBe(false);
    });

    it('returns false for empty object', () => {
        expect(isCreditCardInstrumentLike({})).toBe(false);
    });
});
