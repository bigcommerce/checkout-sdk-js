import { combineReducers, Action } from '@bigcommerce/data-store';

import { CheckoutActionType } from '../checkout';
import * as orderActionTypes from '../order/order-action-types';
import * as quoteActionTypes from '../quote/quote-action-types';

import InternalIncompleteOrder from './internal-incomplete-order';
import InternalOrder from './internal-order';
import mapToInternalIncompleteOrder from './map-to-internal-incomplete-order';
import mapToInternalOrder from './map-to-internal-order';
import OrderState, { OrderErrorsState, OrderMetaState, OrderStatusesState } from './order-state';

const DEFAULT_STATE: OrderState = {
    errors: {},
    meta: {},
    statuses: {},
};

/**
 * @todo Convert this file into TypeScript properly
 * i.e.: Action
 */
export default function orderReducer(state: OrderState = DEFAULT_STATE, action: Action): OrderState {
    const reducer = combineReducers<OrderState>({
        data: dataReducer,
        errors: errorsReducer,
        meta: metaReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(data: InternalOrder | InternalIncompleteOrder | undefined, action: Action): InternalOrder | InternalIncompleteOrder | undefined {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutSucceeded:
        return data ? { ...data, ...mapToInternalIncompleteOrder(action.payload, data) } : data;

    case orderActionTypes.LOAD_ORDER_SUCCEEDED:
        return data ? mapToInternalOrder(action.payload, data as InternalOrder) : data;

    case orderActionTypes.LOAD_INTERNAL_ORDER_SUCCEEDED:
    case orderActionTypes.FINALIZE_ORDER_SUCCEEDED:
    case orderActionTypes.SUBMIT_ORDER_SUCCEEDED:
    case quoteActionTypes.LOAD_QUOTE_SUCCEEDED:
        return action.payload ? { ...data, ...action.payload.order } : data;

    default:
        return data;
    }
}

function metaReducer(meta: OrderMetaState | undefined, action: Action): OrderMetaState | undefined {
    switch (action.type) {
    case orderActionTypes.SUBMIT_ORDER_SUCCEEDED:
        return { ...meta, ...action.meta };

    default:
        return meta;
    }
}

function errorsReducer(errors: OrderErrorsState = DEFAULT_STATE.errors, action: Action): OrderErrorsState {
    switch (action.type) {
    case orderActionTypes.LOAD_ORDER_REQUESTED:
    case orderActionTypes.LOAD_ORDER_SUCCEEDED:
        return { ...errors, loadError: undefined };

    case orderActionTypes.LOAD_ORDER_FAILED:
        return { ...errors, loadError: action.payload };

    default:
        return errors;
    }
}

function statusesReducer(statuses: OrderStatusesState = DEFAULT_STATE.statuses, action: Action): OrderStatusesState {
    switch (action.type) {
    case orderActionTypes.LOAD_ORDER_REQUESTED:
        return { ...statuses, isLoading: true };

    case orderActionTypes.LOAD_ORDER_SUCCEEDED:
    case orderActionTypes.LOAD_ORDER_FAILED:
        return { ...statuses, isLoading: false };
    default:
        return statuses;
    }
}
