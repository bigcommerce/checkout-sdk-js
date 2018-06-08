import { combineReducers } from '@bigcommerce/data-store';

import { CheckoutAction, CheckoutActionType } from '../checkout';

import InternalOrder, { InternalIncompleteOrder } from './internal-order';
import mapToInternalOrder, { mapToInternalIncompleteOrder } from './map-to-internal-order';
import { OrderAction, OrderActionType } from './order-actions';
import OrderState, { OrderErrorsState, OrderMetaState, OrderStatusesState } from './order-state';

const DEFAULT_STATE: OrderState = {
    errors: {},
    meta: {},
    statuses: {},
};

export default function orderReducer(
    state: OrderState = DEFAULT_STATE,
    action: OrderAction | CheckoutAction
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
    action: OrderAction | CheckoutAction
): InternalOrder | InternalIncompleteOrder | undefined {
    switch (action.type) {
    case OrderActionType.LoadOrderSucceeded:
        return action.payload ? { ...data, ...mapToInternalOrder(action.payload) } : data;

    case CheckoutActionType.LoadCheckoutSucceeded:
        return action.payload ? { ...data, ...mapToInternalIncompleteOrder(action.payload) } : data;

    case OrderActionType.FinalizeOrderSucceeded:
    case OrderActionType.SubmitOrderSucceeded:
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
