import { createPoConfigSelectorFactory } from './po-config-selector';
import PoConfigState, { DEFAULT_STATE } from './po-config-state';

describe('createPoConfigSelectorFactory()', () => {
    const createSelector = createPoConfigSelectorFactory();

    it('returns undefined config when no data is loaded', () => {
        const selector = createSelector(DEFAULT_STATE);

        expect(selector.getConfig()).toBeUndefined();
    });

    it('returns the config object when data is loaded', () => {
        const config = { enabled: true, label: 'PO Number', required: false };
        const state: PoConfigState = {
            ...DEFAULT_STATE,
            data: config,
        };
        const selector = createSelector(state);

        expect(selector.getConfig()).toEqual(config);
    });

    it('returns false for isLoading when not loading', () => {
        const selector = createSelector(DEFAULT_STATE);

        expect(selector.isLoading()).toBe(false);
    });

    it('returns true for isLoading when loading', () => {
        const state: PoConfigState = {
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
        const error = new Error('PO config load failed');
        const state: PoConfigState = {
            ...DEFAULT_STATE,
            errors: { loadError: error },
        };
        const selector = createSelector(state);

        expect(selector.getLoadError()).toBe(error);
    });
});
