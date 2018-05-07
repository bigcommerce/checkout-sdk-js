import { combineReducers, Action } from '@bigcommerce/data-store';

import Config, { StoreConfig } from './config';
import { ConfigActionType } from './config-action-types';

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

function dataReducer(data: StoreConfig | undefined, action: Action<Config>): StoreConfig | undefined {
    switch (action.type) {
    case ConfigActionType.LoadConfigSucceeded:
        return action.payload ? action.payload.storeConfig : data;

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
    case ConfigActionType.LoadConfigSucceeded:
        return { ...errors, loadError: undefined };

    case ConfigActionType.LoadConfigFailed:
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
    case ConfigActionType.LoadConfigRequested:
        return { ...statuses, isLoading: true };

    case ConfigActionType.LoadConfigSucceeded:
    case ConfigActionType.LoadConfigFailed:
        return { ...statuses, isLoading: false };

    default:
        return statuses;
    }
}
