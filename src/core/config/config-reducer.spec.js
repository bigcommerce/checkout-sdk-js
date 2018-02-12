import { configReducer } from './index';
import { getConfigState } from './configs.mock';
import { getErrorResponse } from '../common/http-request/responses.mock';
import * as configActionTypes from './config-action-types';

describe('configReducer()', () => {
    let initialState;

    beforeEach(() => {
        initialState = {};
    });

    it('loads the config', () => {
        const action = {
            type: configActionTypes.LOAD_CONFIG_REQUESTED,
        };

        expect(configReducer(initialState, action)).toEqual(expect.objectContaining({
            statuses: { isLoading: true },
        }));
    });

    it('returns config data if it was load successfully', () => {
        const action = {
            type: configActionTypes.LOAD_CONFIG_SUCCEEDED,
            payload: getConfigState().data,
        };

        expect(configReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload,
            statuses: { isLoading: false },
        }));
    });

    it('returns an error if loading fails', () => {
        const action = {
            type: configActionTypes.LOAD_CONFIG_FAILED,
            payload: getErrorResponse(),
        };

        expect(configReducer(initialState, action)).toEqual(expect.objectContaining({
            errors: { loadError: getErrorResponse() },
            statuses: { isLoading: false },
        }));
    });
});
