import { createB2BPostOrderSelectorFactory } from './b2b-post-order-selector';
import B2BPostOrderState, { DEFAULT_STATE } from './b2b-post-order-state';

describe('createB2BPostOrderSelectorFactory()', () => {
    const createSelector = createB2BPostOrderSelectorFactory();

    it('returns undefined receipt id when no data is loaded', () => {
        const selector = createSelector(DEFAULT_STATE);

        expect(selector.getReceiptId()).toBeUndefined();
    });

    it('returns the receipt id string when data is loaded', () => {
        const state: B2BPostOrderState = {
            ...DEFAULT_STATE,
            data: { receiptId: 'rcpt_1' },
        };
        const selector = createSelector(state);

        expect(selector.getReceiptId()).toBe('rcpt_1');
    });

    it('returns false for isPersisting when not persisting', () => {
        const selector = createSelector(DEFAULT_STATE);

        expect(selector.isPersisting()).toBe(false);
    });

    it('returns true for isPersisting when persisting', () => {
        const state: B2BPostOrderState = {
            ...DEFAULT_STATE,
            statuses: { isPersisting: true },
        };
        const selector = createSelector(state);

        expect(selector.isPersisting()).toBe(true);
    });

    it('returns undefined for getPersistError when no error', () => {
        const selector = createSelector(DEFAULT_STATE);

        expect(selector.getPersistError()).toBeUndefined();
    });

    it('returns error for getPersistError when there is an error', () => {
        const error = new Error('B2B metadata persist failed');
        const state: B2BPostOrderState = {
            ...DEFAULT_STATE,
            errors: { persistB2bMetadataError: error },
        };
        const selector = createSelector(state);

        expect(selector.getPersistError()).toBe(error);
    });
});
