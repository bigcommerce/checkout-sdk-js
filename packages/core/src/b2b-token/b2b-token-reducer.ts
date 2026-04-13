import { Action, combineReducers, composeReducers } from '@bigcommerce/data-store';

import { clearErrorReducer } from '../common/error';
import { objectSet } from '../common/utility';

import B2BToken from './b2b-token';
import { B2BTokenActionType, LoadB2BTokenAction } from './b2b-token-actions';
import B2BTokenState, {
    B2BTokenErrorsState,
    B2BTokenStatusesState,
    DEFAULT_STATE,
} from './b2b-token-state';

export default function b2bTokenReducer(
    state: B2BTokenState = DEFAULT_STATE,
    action: Action,
): B2BTokenState {
    const reducer = combineReducers<B2BTokenState>({
        data: dataReducer,
        errors: composeReducers(errorsReducer, clearErrorReducer),
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(data: B2BToken | undefined, action: LoadB2BTokenAction): B2BToken | undefined {
    switch (action.type) {
        case B2BTokenActionType.LoadB2BTokenSucceeded:
            return action.payload;

        default:
            return data;
    }
}

function errorsReducer(
    errors: B2BTokenErrorsState = DEFAULT_STATE.errors,
    action: LoadB2BTokenAction,
): B2BTokenErrorsState {
    switch (action.type) {
        case B2BTokenActionType.LoadB2BTokenRequested:
        case B2BTokenActionType.LoadB2BTokenSucceeded:
            return objectSet(errors, 'loadError', undefined);

        case B2BTokenActionType.LoadB2BTokenFailed:
            return objectSet(errors, 'loadError', action.payload);

        default:
            return errors;
    }
}

function statusesReducer(
    statuses: B2BTokenStatusesState = DEFAULT_STATE.statuses,
    action: LoadB2BTokenAction,
): B2BTokenStatusesState {
    switch (action.type) {
        case B2BTokenActionType.LoadB2BTokenRequested:
            return objectSet(statuses, 'isLoading', true);

        case B2BTokenActionType.LoadB2BTokenFailed:
        case B2BTokenActionType.LoadB2BTokenSucceeded:
            return objectSet(statuses, 'isLoading', false);

        default:
            return statuses;
    }
}
