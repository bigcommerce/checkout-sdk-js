import { combineReducers, composeReducers, Action } from '@bigcommerce/data-store';
import { omit } from 'lodash';

import { clearErrorReducer } from '../common/error';
import { objectMerge, objectSet } from '../common/utility';

import { OrderAction, OrderActionType } from './order-actions';
import OrderState, { DEFAULT_STATE, OrderDataState, OrderErrorsState, OrderMetaState, OrderStatusesState } from './order-state';
import { SpamProtectionAction, SpamProtectionActionType } from './spam-protection';

export default function orderReducer(
    state: OrderState = DEFAULT_STATE,
    action: Action
): OrderState {
    const reducer = combineReducers<OrderState>({
        data: dataReducer,
        errors: composeReducers(errorsReducer, clearErrorReducer),
        meta: metaReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(
    data: OrderDataState | undefined,
    action: OrderAction
): OrderDataState | undefined {
    switch (action.type) {
    case OrderActionType.LoadOrderSucceeded:
    case OrderActionType.LoadOrderPaymentsSucceeded:
        return objectMerge(data, omit(action.payload, ['billingAddress', 'coupons'])) as OrderDataState;

    default:
        return data;
    }
}

function metaReducer(
    meta: OrderMetaState | undefined,
    action: OrderAction | SpamProtectionAction
): OrderMetaState | undefined {
    switch (action.type) {
    case OrderActionType.FinalizeOrderSucceeded:
    case OrderActionType.SubmitOrderSucceeded:
        return objectMerge(meta, {
            ...action.meta,
            callbackUrl: action.payload && action.payload.order.callbackUrl,
            orderToken: action.payload && action.payload.order.token,
            payment: action.payload && action.payload.order && action.payload.order.payment,
        });

    case SpamProtectionActionType.Completed:
        return objectSet(meta, 'spamProtectionToken', action.payload);

    default:
        return meta;
    }
}

function errorsReducer(
    errors: OrderErrorsState = DEFAULT_STATE.errors,
    action: OrderAction
): OrderErrorsState {
    switch (action.type) {
    case OrderActionType.LoadOrderRequested:
    case OrderActionType.LoadOrderSucceeded:
    case OrderActionType.LoadOrderPaymentsSucceeded:
    case OrderActionType.LoadOrderPaymentsRequested:
        return objectSet(errors, 'loadError', undefined);

    case OrderActionType.LoadOrderFailed:
    case OrderActionType.LoadOrderPaymentsFailed:
        return objectSet(errors, 'loadError', action.payload);

    default:
        return errors;
    }
}

function statusesReducer(
    statuses: OrderStatusesState = DEFAULT_STATE.statuses,
    action: OrderAction
): OrderStatusesState {
    switch (action.type) {
    case OrderActionType.LoadOrderRequested:
    case OrderActionType.LoadOrderPaymentsRequested:
        return objectSet(statuses, 'isLoading', true);

    case OrderActionType.LoadOrderSucceeded:
    case OrderActionType.LoadOrderFailed:
    case OrderActionType.LoadOrderPaymentsSucceeded:
    case OrderActionType.LoadOrderPaymentsFailed:
        return objectSet(statuses, 'isLoading', false);

    default:
        return statuses;
    }
}
