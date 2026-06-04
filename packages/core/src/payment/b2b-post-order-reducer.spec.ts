import { createAction, createErrorAction } from '@bigcommerce/data-store';

import { B2BPostOrderActionType } from './b2b-post-order-actions';
import b2bPostOrderReducer from './b2b-post-order-reducer';
import B2BPostOrderState, { DEFAULT_STATE } from './b2b-post-order-state';

describe('b2bPostOrderReducer()', () => {
    let initialState: B2BPostOrderState;

    beforeEach(() => {
        initialState = DEFAULT_STATE;
    });

    it('returns persisting state on requested', () => {
        const action = createAction(B2BPostOrderActionType.PersistB2BMetadataRequested);
        const state = b2bPostOrderReducer(initialState, action);

        expect(state.statuses.isPersisting).toBe(true);
        expect(state.errors.persistError).toBeUndefined();
    });

    it('stores receipt id and clears persisting state on success', () => {
        const data = { receiptId: 'rcpt_1' };
        const action = createAction(B2BPostOrderActionType.PersistB2BMetadataSucceeded, data);
        const state = b2bPostOrderReducer(initialState, action);

        expect(state.data).toEqual(data);
        expect(state.statuses.isPersisting).toBe(false);
        expect(state.errors.persistError).toBeUndefined();
    });

    it('stores error and clears persisting state on failure', () => {
        const error = new Error('Failed to persist B2B metadata');
        const action = createErrorAction(B2BPostOrderActionType.PersistB2BMetadataFailed, error);
        const state = b2bPostOrderReducer(initialState, action);

        expect(state.errors.persistError).toBe(error);
        expect(state.statuses.isPersisting).toBe(false);
        expect(state.data).toBeUndefined();
    });

    it('returns previous state for unknown actions', () => {
        const action = { type: 'UNKNOWN_ACTION' } as any;
        const state = b2bPostOrderReducer(initialState, action);

        expect(state).toEqual(initialState);
    });
});
