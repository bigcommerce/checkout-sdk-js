import { Action, combineReducers, composeReducers } from '@bigcommerce/data-store';

import { clearErrorReducer } from '../common/error';
import { objectSet } from '../common/utility';

import { LoadPoConfigAction, PoConfigActionType } from './po-config-actions';
import PoConfigState, {
    DEFAULT_STATE,
    PoConfig,
    PoConfigErrorsState,
    PoConfigStatusesState,
} from './po-config-state';

export default function poConfigReducer(
    state: PoConfigState = DEFAULT_STATE,
    action: Action,
): PoConfigState {
    const reducer = combineReducers<PoConfigState>({
        data: dataReducer,
        errors: composeReducers(errorsReducer, clearErrorReducer),
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(data: PoConfig | undefined, action: LoadPoConfigAction): PoConfig | undefined {
    switch (action.type) {
        case PoConfigActionType.LoadPoConfigSucceeded:
            return action.payload;

        default:
            return data;
    }
}

function errorsReducer(
    errors: PoConfigErrorsState = DEFAULT_STATE.errors,
    action: LoadPoConfigAction,
): PoConfigErrorsState {
    switch (action.type) {
        case PoConfigActionType.LoadPoConfigRequested:
        case PoConfigActionType.LoadPoConfigSucceeded:
            return objectSet(errors, 'loadError', undefined);

        case PoConfigActionType.LoadPoConfigFailed:
            return objectSet(errors, 'loadError', action.payload);

        default:
            return errors;
    }
}

function statusesReducer(
    statuses: PoConfigStatusesState = DEFAULT_STATE.statuses,
    action: LoadPoConfigAction,
): PoConfigStatusesState {
    switch (action.type) {
        case PoConfigActionType.LoadPoConfigRequested:
            return objectSet(statuses, 'isLoading', true);

        case PoConfigActionType.LoadPoConfigFailed:
        case PoConfigActionType.LoadPoConfigSucceeded:
            return objectSet(statuses, 'isLoading', false);

        default:
            return statuses;
    }
}
