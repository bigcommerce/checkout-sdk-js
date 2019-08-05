import { combineReducers, composeReducers, Action } from '@bigcommerce/data-store';

import { clearErrorReducer } from '../common/error';
import { objectMerge, objectSet } from '../common/utility';

import Config from './config';
import { ConfigActionType, LoadConfigAction } from './config-actions';
import ConfigState, { ConfigErrorsState, ConfigStatusesState, DEFAULT_STATE } from './config-state';

export default function configReducer(
    state: ConfigState = DEFAULT_STATE,
    action: Action
): ConfigState {
    const reducer = combineReducers<ConfigState>({
        data: dataReducer,
        errors: composeReducers(errorsReducer, clearErrorReducer),
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(
    data: Config | undefined,
    action: LoadConfigAction
): Config | undefined {
    switch (action.type) {
    case ConfigActionType.LoadConfigSucceeded:
        return objectMerge(data, action.payload);

    default:
        return data;
    }
}

function errorsReducer(
    errors: ConfigErrorsState = DEFAULT_STATE.errors,
    action: LoadConfigAction
): ConfigErrorsState {
    switch (action.type) {
    case ConfigActionType.LoadConfigSucceeded:
        return objectSet(errors, 'loadError', undefined);

    case ConfigActionType.LoadConfigFailed:
        return objectSet(errors, 'loadError', action.payload);

    default:
        return errors;
    }
}

function statusesReducer(
    statuses: ConfigStatusesState = DEFAULT_STATE.statuses,
    action: LoadConfigAction
): ConfigStatusesState {
    switch (action.type) {
    case ConfigActionType.LoadConfigRequested:
        return objectSet(statuses, 'isLoading', true);

    case ConfigActionType.LoadConfigSucceeded:
    case ConfigActionType.LoadConfigFailed:
        return objectSet(statuses, 'isLoading', false);

    default:
        return statuses;
    }
}
