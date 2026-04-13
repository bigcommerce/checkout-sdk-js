import { createAction, createErrorAction } from '@bigcommerce/data-store';

import { B2BTokenActionType } from './b2b-token-actions';
import b2bTokenReducer from './b2b-token-reducer';
import B2BTokenState, { DEFAULT_STATE } from './b2b-token-state';

describe('b2bTokenReducer()', () => {
    let initialState: B2BTokenState;

    beforeEach(() => {
        initialState = DEFAULT_STATE;
    });

    it('returns loading state on requested', () => {
        const action = createAction(B2BTokenActionType.LoadB2BTokenRequested);
        const state = b2bTokenReducer(initialState, action);

        expect(state.statuses.isLoading).toBe(true);
        expect(state.errors.loadError).toBeUndefined();
    });

    it('stores token and clears loading state on success', () => {
        const token = { token: 'my-b2b-token' };
        const action = createAction(B2BTokenActionType.LoadB2BTokenSucceeded, token);
        const state = b2bTokenReducer(initialState, action);

        expect(state.data).toEqual(token);
        expect(state.statuses.isLoading).toBe(false);
        expect(state.errors.loadError).toBeUndefined();
    });

    it('stores error and clears loading state on failure', () => {
        const error = new Error('Failed to load B2B token');
        const action = createErrorAction(B2BTokenActionType.LoadB2BTokenFailed, error);
        const state = b2bTokenReducer(initialState, action);

        expect(state.errors.loadError).toBe(error);
        expect(state.statuses.isLoading).toBe(false);
        expect(state.data).toBeUndefined();
    });

    it('returns previous state for unknown actions', () => {
        const action = { type: 'UNKNOWN_ACTION' } as any;
        const state = b2bTokenReducer(initialState, action);

        expect(state).toEqual(initialState);
    });
});
