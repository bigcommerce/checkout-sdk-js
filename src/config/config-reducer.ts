import { combineReducers, Action } from '@bigcommerce/data-store';

import Config from './config';
import * as configActionType from './config-action-types';
import LegacyConfig from './legacy-config';
import mapToLegacyConfig from './map-to-legacy-config';

/**
 * @todo Convert this file into TypeScript properly
 * @param {ConfigState} state
 * @param {Action} action
 * @return {ConfigState}
 */
export default function configReducer(state: any = {}, action: Action<Config>): any {
    const reducer = combineReducers({
        data: dataReducer,
        errors: errorsReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(data: LegacyConfig | undefined, action: Action<Config>): LegacyConfig | undefined {
    switch (action.type) {
    case configActionType.LOAD_CONFIG_SUCCEEDED:
        return action.payload ? { ...data, ...mapToLegacyConfig(action.payload.storeConfig) } : data;

    default:
        return data;
    }
}

/**
 * @private
 * @param {Object} errors
 * @param {Action} action
 * @return {Object}
 */
function errorsReducer(errors: any = {}, action: Action): any {
    switch (action.type) {
    case configActionType.LOAD_CONFIG_SUCCEEDED:
        return { ...errors, loadError: undefined };

    case configActionType.LOAD_CONFIG_FAILED:
        return { ...errors, loadError: action.payload };

    default:
        return errors;
    }
}

/**
 * @private
 * @param {Object} statuses
 * @param {Action} action
 * @return {Object}
 */
function statusesReducer(statuses: any = {}, action: Action): any {
    switch (action.type) {
    case configActionType.LOAD_CONFIG_REQUESTED:
        return { ...statuses, isLoading: true };

    case configActionType.LOAD_CONFIG_SUCCEEDED:
    case configActionType.LOAD_CONFIG_FAILED:
        return { ...statuses, isLoading: false };

    default:
        return statuses;
    }
}
