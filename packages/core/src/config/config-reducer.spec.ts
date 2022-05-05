import { createAction, createErrorAction } from '@bigcommerce/data-store';

import { ConfigActionType } from './config-actions';
import { getConfig } from './configs.mock';
import { configReducer, ConfigState } from './index';

describe('configReducer()', () => {
    let initialState: ConfigState;

    beforeEach(() => {
        initialState = {
            errors: {},
            statuses: {},
        };
    });

    it('loads the config', () => {
        const action = createAction(ConfigActionType.LoadConfigRequested);

        expect(configReducer(initialState, action)).toMatchObject({
            statuses: { isLoading: true },
        });
    });

    it('returns config data if it was load successfully', () => {
        const action = createAction(ConfigActionType.LoadConfigSucceeded, getConfig());

        expect(configReducer(initialState, action)).toMatchObject({
            data: action.payload,
            statuses: { isLoading: false },
        });
    });

    it('returns an error if loading fails', () => {
        const action = createErrorAction(ConfigActionType.LoadConfigFailed, new Error());

        expect(configReducer(initialState, action)).toMatchObject({
            errors: { loadError: action.payload },
            statuses: { isLoading: false },
        });
    });
});
