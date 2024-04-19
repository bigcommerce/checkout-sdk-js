import { Action, combineReducers, composeReducers } from '@bigcommerce/data-store';

import { clearErrorReducer } from '../common/error';
import { arrayReplace, objectSet } from '../common/utility';

import { Extension } from './extension';
import { ExtensionAction, ExtensionActionType } from './extension-actions';
import {
    DEFAULT_STATE,
    ExtensionErrorsState,
    ExtensionState,
    ExtensionStatusesState,
} from './extension-state';

export function extensionReducer(
    state: ExtensionState = DEFAULT_STATE,
    action: Action,
): ExtensionState {
    const reducer = combineReducers<ExtensionState>({
        data: dataReducer,
        errors: composeReducers(errorsReducer, clearErrorReducer),
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(
    data: Extension[] | undefined,
    action: ExtensionAction,
): Extension[] | undefined {
    if (action.type === ExtensionActionType.LoadExtensionsSucceeded) {
        return arrayReplace(data, action.payload);
    }

    return data;
}

function errorsReducer(
    errors: ExtensionErrorsState = DEFAULT_STATE.errors,
    action: ExtensionAction,
): ExtensionErrorsState {
    switch (action.type) {
        case ExtensionActionType.LoadExtensionsRequested:
        case ExtensionActionType.LoadExtensionsSucceeded:
            return objectSet(errors, 'loadError', undefined);

        case ExtensionActionType.RenderExtensionRequested:
        case ExtensionActionType.RenderExtensionSucceeded:
            return objectSet(errors, 'renderError', undefined);

        case ExtensionActionType.LoadExtensionsFailed:
            return objectSet(errors, 'loadError', action.payload);

        case ExtensionActionType.RenderExtensionFailed:
            return objectSet(errors, 'renderError', action.payload);

        default:
            return errors;
    }
}

function statusesReducer(
    statuses: ExtensionStatusesState = DEFAULT_STATE.statuses,
    action: ExtensionAction,
): ExtensionStatusesState {
    switch (action.type) {
        case ExtensionActionType.LoadExtensionsRequested:
            return objectSet(statuses, 'isLoading', true);

        case ExtensionActionType.LoadExtensionsSucceeded:
        case ExtensionActionType.LoadExtensionsFailed:
            return objectSet(statuses, 'isLoading', false);

        default:
            return statuses;
    }
}
