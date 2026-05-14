import { createAction, createErrorAction } from '@bigcommerce/data-store';

import { PoConfigActionType } from './po-config-actions';
import poConfigReducer from './po-config-reducer';
import PoConfigState, { DEFAULT_STATE } from './po-config-state';

describe('poConfigReducer()', () => {
    let initialState: PoConfigState;

    beforeEach(() => {
        initialState = DEFAULT_STATE;
    });

    it('returns loading state on requested', () => {
        const action = createAction(PoConfigActionType.LoadPoConfigRequested);
        const state = poConfigReducer(initialState, action);

        expect(state.statuses.isLoading).toBe(true);
        expect(state.errors.loadError).toBeUndefined();
    });

    it('stores config and clears loading state on success', () => {
        const config = { enabled: true, label: 'PO Number', required: false };
        const action = createAction(PoConfigActionType.LoadPoConfigSucceeded, config);
        const state = poConfigReducer(initialState, action);

        expect(state.data).toEqual(config);
        expect(state.statuses.isLoading).toBe(false);
        expect(state.errors.loadError).toBeUndefined();
    });

    it('stores error and clears loading state on failure', () => {
        const error = new Error('Failed to load PO config');
        const action = createErrorAction(PoConfigActionType.LoadPoConfigFailed, error);
        const state = poConfigReducer(initialState, action);

        expect(state.errors.loadError).toBe(error);
        expect(state.statuses.isLoading).toBe(false);
        expect(state.data).toBeUndefined();
    });

    it('returns previous state for unknown actions', () => {
        const action = { type: 'UNKNOWN_ACTION' } as any;
        const state = poConfigReducer(initialState, action);

        expect(state).toEqual(initialState);
    });
});
