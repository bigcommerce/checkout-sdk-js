import { combineReducers } from '@bigcommerce/data-store';

import Config from './config';
import { ConfigActionType, LoadConfigAction } from './config-actions';
import ConfigState, { ConfigErrorsState, ConfigStatusesState } from './config-state';

const DEFAULT_STATE: ConfigState = {
    meta: {},
    errors: {},
    statuses: {},
};

export default function configReducer(
    state: ConfigState = DEFAULT_STATE,
    action: LoadConfigAction
): ConfigState {
    const reducer = combineReducers<ConfigState, LoadConfigAction>({
        data: dataReducer,
        errors: errorsReducer,
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
        return action.payload ? action.payload : data;

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
        return { ...errors, loadError: undefined };

    case ConfigActionType.LoadConfigFailed:
        return { ...errors, loadError: action.payload };

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
        return { ...statuses, isLoading: true };

    case ConfigActionType.LoadConfigSucceeded:
    case ConfigActionType.LoadConfigFailed:
        return { ...statuses, isLoading: false };

    default:
        return statuses;
    }
}
