import { createB2BTokenSelectorFactory } from './b2b-token-selector';
import B2BTokenState, { DEFAULT_STATE } from './b2b-token-state';

describe('createB2BTokenSelectorFactory()', () => {
    const createSelector = createB2BTokenSelectorFactory();

    it('returns undefined token when no data is loaded', () => {
        const selector = createSelector(DEFAULT_STATE);

        expect(selector.getToken()).toBeUndefined();
    });

    it('returns the token string when data is loaded', () => {
        const state: B2BTokenState = {
            ...DEFAULT_STATE,
            data: { token: 'my-b2b-token' },
        };
        const selector = createSelector(state);

        expect(selector.getToken()).toBe('my-b2b-token');
    });

    it('returns false for isLoading when not loading', () => {
        const selector = createSelector(DEFAULT_STATE);

        expect(selector.isLoading()).toBe(false);
    });

    it('returns true for isLoading when loading', () => {
        const state: B2BTokenState = {
            ...DEFAULT_STATE,
            statuses: { isLoading: true },
        };
        const selector = createSelector(state);

        expect(selector.isLoading()).toBe(true);
    });

    it('returns undefined for getLoadError when no error', () => {
        const selector = createSelector(DEFAULT_STATE);

        expect(selector.getLoadError()).toBeUndefined();
    });

    it('returns error for getLoadError when there is an error', () => {
        const error = new Error('B2B token load failed');
        const state: B2BTokenState = {
            ...DEFAULT_STATE,
            errors: { loadError: error },
        };
        const selector = createSelector(state);

        expect(selector.getLoadError()).toBe(error);
    });
});
