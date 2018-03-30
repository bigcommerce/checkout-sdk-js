import { combineReducers, Action } from '@bigcommerce/data-store';

import { CheckoutActionType } from '../checkout';
import * as orderActionTypes from '../order/order-action-types';
import * as quoteActionTypes from '../quote/quote-action-types';

import InternalOrder from './internal-order';
import mapToInternalIncompleteOrder from './map-to-internal-incomplete-order';

/**
 * @todo Convert this file into TypeScript properly
 * @param {OrderState} state
 * @param {Action} action
 * @return {OrderState}
 */
export default function orderReducer(state: any = {}, action: Action): any {
    const reducer = combineReducers<any>({
        data: dataReducer,
        errors: errorsReducer,
        meta: metaReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(data: InternalOrder, action: Action): InternalOrder {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutSucceeded:
        return { ...data, ...mapToInternalIncompleteOrder(action.payload, data) };

    case orderActionTypes.LOAD_ORDER_SUCCEEDED:
    case orderActionTypes.FINALIZE_ORDER_SUCCEEDED:
    case orderActionTypes.SUBMIT_ORDER_SUCCEEDED:
    case quoteActionTypes.LOAD_QUOTE_SUCCEEDED:
        return action.payload ? { ...data, ...action.payload.order } : data;

    default:
        return data;
    }
}

function metaReducer(meta: any, action: Action): any {
    switch (action.type) {
    case orderActionTypes.SUBMIT_ORDER_SUCCEEDED:
        return { ...meta, ...action.meta };

    default:
        return meta;
    }
}

function errorsReducer(errors: any = {}, action: Action): any {
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

function statusesReducer(statuses: any = {}, action: Action): any {
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
