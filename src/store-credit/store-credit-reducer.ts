import { combineReducers, composeReducers, Action } from '@bigcommerce/data-store';

import { clearErrorReducer } from '../common/error';
import { objectSet } from '../common/utility';

import { StoreCreditAction, StoreCreditActionType } from './store-credit-actions';
import StoreCreditState, { StoreCreditErrorsState, StoreCreditStatusesState } from './store-credit-state';

const DEFAULT_STATE: StoreCreditState = {
    errors: {},
    statuses: {},
};

export default function storeCreditReducer(
    state: StoreCreditState = DEFAULT_STATE,
    action: Action
): StoreCreditState {
    const reducer = combineReducers<StoreCreditState>({
        errors: composeReducers(errorsReducer, clearErrorReducer),
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function errorsReducer(
    errors: StoreCreditErrorsState = DEFAULT_STATE.errors,
    action: StoreCreditAction
): StoreCreditErrorsState {
    switch (action.type) {
    case StoreCreditActionType.ApplyStoreCreditRequested:
    case StoreCreditActionType.ApplyStoreCreditSucceeded:
        return objectSet(errors, 'applyError', undefined);

    case StoreCreditActionType.ApplyStoreCreditFailed:
        return objectSet(errors, 'applyError', action.payload);

    default:
        return errors;
    }
}

function statusesReducer(
    statuses: StoreCreditStatusesState = DEFAULT_STATE.statuses,
    action: StoreCreditAction
): StoreCreditStatusesState {
    switch (action.type) {
    case StoreCreditActionType.ApplyStoreCreditRequested:
        return objectSet(statuses, 'isApplying', true);

    case StoreCreditActionType.ApplyStoreCreditSucceeded:
    case StoreCreditActionType.ApplyStoreCreditFailed:
        return objectSet(statuses, 'isApplying', false);

    default:
        return statuses;
    }
}
