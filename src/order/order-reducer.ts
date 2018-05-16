import { combineReducers, Action } from '@bigcommerce/data-store';

import { CheckoutAction, CheckoutActionType } from '../checkout';
import * as quoteActionTypes from '../quote/quote-action-types';

import InternalOrder, { InternalIncompleteOrder } from './internal-order';
import mapToInternalIncompleteOrder from './map-to-internal-incomplete-order';
import mapToInternalOrder from './map-to-internal-order';
import { OrderAction, OrderActionType } from './order-actions';
import OrderState, { OrderErrorsState, OrderMetaState, OrderStatusesState } from './order-state';

const DEFAULT_STATE: OrderState = {
    errors: {},
    meta: {},
    statuses: {},
};

export default function orderReducer(
    state: OrderState = DEFAULT_STATE,
    action: Action | CheckoutAction | OrderAction
): OrderState {
    const reducer = combineReducers<OrderState>({
        data: dataReducer,
        errors: errorsReducer,
        meta: metaReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(
    data: InternalOrder | InternalIncompleteOrder | undefined,
    action: Action | CheckoutAction | OrderAction
): InternalOrder | InternalIncompleteOrder | undefined {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutSucceeded:
        return data ? { ...data, ...mapToInternalIncompleteOrder(action.payload, data) } : data;

    case OrderActionType.LoadOrderSucceeded:
        return data ? mapToInternalOrder(action.payload, data as InternalOrder) : data;

    case OrderActionType.LoadInternalOrderSucceeded:
    case OrderActionType.FinalizeOrderSucceeded:
    case OrderActionType.SubmitOrderSucceeded:
    case quoteActionTypes.LOAD_QUOTE_SUCCEEDED:
        return action.payload ? { ...data, ...action.payload.order } : data;

    default:
        return data;
    }
}

function metaReducer(
    meta: OrderMetaState | undefined,
    action: OrderAction
): OrderMetaState | undefined {
    switch (action.type) {
    case OrderActionType.SubmitOrderSucceeded:
        return action.payload ? {
            ...meta,
            ...action.meta,
            payment: action.payload.order && action.payload.order.payment,
        } : meta;

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
        return { ...errors, loadError: undefined };

    case OrderActionType.LoadOrderFailed:
        return { ...errors, loadError: action.payload };

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
        return { ...statuses, isLoading: true };

    case OrderActionType.LoadOrderSucceeded:
    case OrderActionType.LoadOrderFailed:
        return { ...statuses, isLoading: false };
    default:
        return statuses;
    }
}
