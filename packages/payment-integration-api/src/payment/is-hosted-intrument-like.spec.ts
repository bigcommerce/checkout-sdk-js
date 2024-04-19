import isHostedInstrumentLike from './is-hosted-intrument-like';

describe('isHostedInstrumentLike', () => {
    it('returns true if the object has both matching properties as undefined', () => {
        expect(
            isHostedInstrumentLike({
                shouldSaveInstrument: undefined,
                shouldSetAsDefaultInstrument: undefined,
            }),
        ).toBe(true);
    });

    it('returns true if the object has any matching properties as undefined', () => {
        expect(
            isHostedInstrumentLike({
                shouldSaveInstrument: true,
                shouldSetAsDefaultInstrument: undefined,
            }),
        ).toBe(true);
    });

    it('returns true if the object has any matching properties as undefined and false', () => {
        expect(
            isHostedInstrumentLike({
                shouldSaveInstrument: undefined,
                shouldSetAsDefaultInstrument: false,
            }),
        ).toBe(true);
    });

    it('returns true if the object has both boolean values as false', () => {
        expect(
            isHostedInstrumentLike({
                shouldSaveInstrument: false,
                shouldSetAsDefaultInstrument: false,
            }),
        ).toBe(true);
    });

    it('returns true if the object has both boolean values as true', () => {
        expect(
            isHostedInstrumentLike({
                shouldSaveInstrument: true,
                shouldSetAsDefaultInstrument: true,
            }),
        ).toBe(true);
    });

    it('returns true if the object has both boolean values', () => {
        expect(
            isHostedInstrumentLike({
                shouldSaveInstrument: true,
                shouldSetAsDefaultInstrument: false,
            }),
        ).toBe(true);
    });

    it('returns true if the object has at least one matching property', () => {
        expect(
            isHostedInstrumentLike({
                shouldSaveInstrument: true,
            }),
        ).toBe(true);
    });

    it('returns true if the object is object-like', () => {
        expect(isHostedInstrumentLike({})).toBe(true);
    });

    it('returns false if the object is null', () => {
        expect(isHostedInstrumentLike(null)).toBe(false);
    });

    it('returns false if the object is undefined', () => {
        expect(isHostedInstrumentLike(undefined)).toBe(false);
    });
});
