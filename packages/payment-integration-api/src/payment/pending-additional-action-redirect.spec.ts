import {
    consumePendingAdditionalActionRedirect,
    markPendingAdditionalActionRedirect,
} from './pending-additional-action-redirect';

describe('pending additional action redirect marker', () => {
    beforeEach(() => {
        window.sessionStorage.clear();
    });

    it('returns true when the consumed methodId matches the marked one', () => {
        markPendingAdditionalActionRedirect('googlepaycheckoutcom');

        expect(consumePendingAdditionalActionRedirect('googlepaycheckoutcom')).toBe(true);
    });

    it('returns false when no marker was set', () => {
        expect(consumePendingAdditionalActionRedirect('googlepaycheckoutcom')).toBe(false);
    });

    it('returns false when the consumed methodId does not match the marked one', () => {
        markPendingAdditionalActionRedirect('adyenv3');

        expect(consumePendingAdditionalActionRedirect('googlepaycheckoutcom')).toBe(false);
    });

    it('returns false when no methodId is provided', () => {
        markPendingAdditionalActionRedirect('googlepaycheckoutcom');

        expect(consumePendingAdditionalActionRedirect()).toBe(false);
    });

    it('clears the marker after it has been consumed, even on a mismatch', () => {
        markPendingAdditionalActionRedirect('googlepaycheckoutcom');
        consumePendingAdditionalActionRedirect('some-other-method');

        expect(consumePendingAdditionalActionRedirect('googlepaycheckoutcom')).toBe(false);
    });
});
