import { configReducer } from './index';
import { getAppConfig } from './configs.mock';
import { getErrorResponse } from '../common/http-request/responses.mock';
import { ConfigActionType } from './config-actions';

describe('configReducer()', () => {
    let initialState;

    beforeEach(() => {
        initialState = {};
    });

    it('loads the config', () => {
        const action = {
            type: ConfigActionType.LoadConfigRequested,
        };

        expect(configReducer(initialState, action)).toEqual(expect.objectContaining({
            statuses: { isLoading: true },
        }));
    });

    it('returns config data if it was load successfully', () => {
        const action = {
            type: ConfigActionType.LoadConfigSucceeded,
            payload: getAppConfig(),
        };

        expect(configReducer(initialState, action)).toEqual(expect.objectContaining({
            data: getAppConfig().storeConfig,
            statuses: { isLoading: false },
        }));
    });

    it('returns an error if loading fails', () => {
        const action = {
            type: ConfigActionType.LoadConfigFailed,
            payload: getErrorResponse(),
        };

        expect(configReducer(initialState, action)).toEqual(expect.objectContaining({
            errors: { loadError: getErrorResponse() },
            statuses: { isLoading: false },
        }));
    });
});
