import { combineReducers, composeReducers, Action } from '@bigcommerce/data-store';

import { clearErrorReducer } from '../common/error';
import { objectMerge, objectSet } from '../common/utility';

import { SignInEmail } from './signin-email';
import { SendSignInEmailAction, SignInEmailActionType } from './signin-email-actions';
import SignInEmailState, { DEFAULT_STATE, SignInEmailErrorsState, SignInEmailStatusesState } from './signin-email-state';

export default function signInEmailReducer(
    state: SignInEmailState = DEFAULT_STATE,
    action: Action
): SignInEmailState {
    const reducer = combineReducers<SignInEmailState>({
        data: dataReducer,
        errors: composeReducers(errorsReducer, clearErrorReducer),
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(
    data: SignInEmail | undefined,
    action: SendSignInEmailAction
): SignInEmail | undefined {
    switch (action.type) {
    case SignInEmailActionType.SendSignInEmailSucceeded:
        return objectMerge(data, action.payload);

    default:
        return data;
    }
}

function errorsReducer(
    errors: SignInEmailErrorsState = DEFAULT_STATE.errors,
    action: SendSignInEmailAction
): SignInEmailErrorsState {
    switch (action.type) {
    case SignInEmailActionType.SendSignInEmailRequested:
    case SignInEmailActionType.SendSignInEmailSucceeded:
        return objectSet(errors, 'sendError', undefined);

    case SignInEmailActionType.SendSignInEmailFailed:
        return objectSet(errors, 'sendError', action.payload);

    default:
        return errors;
    }
}

function statusesReducer(
    statuses: SignInEmailStatusesState = DEFAULT_STATE.statuses,
    action: SendSignInEmailAction
): SignInEmailStatusesState {
    switch (action.type) {
    case SignInEmailActionType.SendSignInEmailRequested:
        return objectSet(statuses, 'isSending', true);

    case SignInEmailActionType.SendSignInEmailFailed:
    case SignInEmailActionType.SendSignInEmailSucceeded:
        return objectSet(statuses, 'isSending', false);
    default:
        return statuses;
    }
}
