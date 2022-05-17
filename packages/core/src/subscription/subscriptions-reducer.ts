import { combineReducers, composeReducers, Action } from '@bigcommerce/data-store';

import { clearErrorReducer } from '../common/error';
import { objectSet } from '../common/utility';
import { SubscriptionsActionType, UpdateSubscriptionsAction } from '../subscription';

import SubscriptionsState, { DEFAULT_STATE, SubscriptionsErrorsState, SubscriptionsStatusesState } from './subscriptions-state';

export default function subscriptionsReducer(
    state: SubscriptionsState = DEFAULT_STATE,
    action: Action
): SubscriptionsState {
    const reducer = combineReducers<SubscriptionsState>({
        errors: composeReducers(errorsReducer, clearErrorReducer),
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function errorsReducer(
    errors: SubscriptionsErrorsState = DEFAULT_STATE.errors,
    action: UpdateSubscriptionsAction
): SubscriptionsErrorsState {
    switch (action.type) {
    case SubscriptionsActionType.UpdateSubscriptionsRequested:
    case SubscriptionsActionType.UpdateSubscriptionsSucceeded:
        return objectSet(errors, 'updateError', undefined);

    case SubscriptionsActionType.UpdateSubscriptionsFailed:
        return objectSet(errors, 'updateError', action.payload);

    default:
        return errors;
    }
}

function statusesReducer(
    statuses: SubscriptionsStatusesState = DEFAULT_STATE.statuses,
    action: UpdateSubscriptionsAction
): SubscriptionsStatusesState {
    switch (action.type) {
    case SubscriptionsActionType.UpdateSubscriptionsRequested:
        return objectSet(statuses, 'isUpdating', true);

    case SubscriptionsActionType.UpdateSubscriptionsFailed:
    case SubscriptionsActionType.UpdateSubscriptionsSucceeded:
        return objectSet(statuses, 'isUpdating', false);
    default:
        return statuses;
    }
}
