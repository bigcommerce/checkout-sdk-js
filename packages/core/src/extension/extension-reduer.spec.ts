import { getErrorResponse } from '../common/http-request/responses.mock';

import { ExtensionActionType } from './extension-actions';
import { extensionReducer } from './extension-reducer';
import { ExtensionState } from './extension-state';
import { getExtensions } from './extension.mock';

describe('extensionReducer()', () => {
    let initialState: ExtensionState;

    beforeEach(() => {
        initialState = {
            data: [],
            errors: {},
            statuses: {},
        };
    });

    it('returns new state when loading extensions', () => {
        const action = {
            type: ExtensionActionType.LoadExtensionsRequested,
        };

        expect(extensionReducer(initialState, action)).toEqual({
            ...initialState,
            errors: {},
            statuses: { isLoading: true },
        });
    });

    it('returns new state when extensions are loaded', () => {
        const action = {
            type: ExtensionActionType.LoadExtensionsSucceeded,
            payload: getExtensions(),
        };

        expect(extensionReducer(initialState, action)).toEqual({
            ...initialState,
            data: action.payload,
            errors: { loadError: undefined },
            statuses: { isLoading: false },
        });
    });

    it('returns new state when extensions cannot be loaded', () => {
        const action = {
            type: ExtensionActionType.LoadExtensionsFailed,
            payload: getErrorResponse(),
        };

        expect(extensionReducer(initialState, action)).toEqual({
            ...initialState,
            errors: { loadError: action.payload },
            statuses: { isLoading: false },
        });
    });
});
