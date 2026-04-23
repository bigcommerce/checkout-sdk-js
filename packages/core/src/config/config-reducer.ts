import { Action, combineReducers, composeReducers } from '@bigcommerce/data-store';

import { CheckoutHydrateAction, CheckoutHydrateActionType } from '../checkout';
import { clearErrorReducer } from '../common/error';
import { objectMerge, objectSet } from '../common/utility';

import Config from './config';
import { ConfigActionType, LoadConfigAction } from './config-actions';
import ConfigState, { ConfigErrorsState, ConfigStatusesState, DEFAULT_STATE } from './config-state';

export default function configReducer(
    state: ConfigState = DEFAULT_STATE,
    action: Action,
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
    action: LoadConfigAction | CheckoutHydrateAction,
): Config | undefined {
    switch (action.type) {
        case ConfigActionType.LoadConfigSucceeded:
            return objectMerge(data, action.payload);

        case CheckoutHydrateActionType.HydrateInitialState: {
            const merged = objectMerge(data, action.payload?.config);

            // b2bApiSettings is a top-level field in CheckoutInitialState (separate from config),
            // so it must be merged into storeConfig manually after the config hydration.
            // Skip if config data is absent or this is a non-B2B store (no b2bApiSettings).
            if (!merged || !action.payload?.b2bApiSettings) {
                return merged;
            }

            return {
                ...merged,
                storeConfig: {
                    ...merged.storeConfig,
                    b2bApiSettings: action.payload.b2bApiSettings,
                },
            };
        }

        default:
            return data;
    }
}

function errorsReducer(
    errors: ConfigErrorsState = DEFAULT_STATE.errors,
    action: LoadConfigAction,
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
    action: LoadConfigAction,
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
