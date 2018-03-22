import { combineReducers } from '@bigcommerce/data-store';
import { CheckoutActionType } from '../checkout';
import * as orderActionTypes from '../order/order-action-types';
import * as quoteActionTypes from '../quote/quote-action-types';
import mapToInternalIncompleteOrder from './map-to-internal-incomplete-order';

/**
 * @param {OrderState} state
 * @param {Action} action
 * @return {OrderState}
 */
export default function orderReducer(state = {}, action) {
    const reducer = combineReducers({
        data: dataReducer,
        errors: errorsReducer,
        meta: metaReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

/**
 * @private
 * @param {?InternalOrder} data
 * @param {Action} action
 * @return {?InternalOrder}
 */
function dataReducer(data, action) {
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

/**
 * @private
 * @param {?Object} meta
 * @param {Action} action
 * @return {?Object}
 */
function metaReducer(meta, action) {
    switch (action.type) {
    case orderActionTypes.SUBMIT_ORDER_SUCCEEDED:
        return { ...meta, ...action.meta };

    default:
        return meta;
    }
}

/**
 * @private
 * @param {Object} errors
 * @param {Action} action
 * @return {Object}
 */
function errorsReducer(errors = {}, action) {
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

/**
 * @private
 * @param {Object} statuses
 * @param {Action} action
 * @return {Object}
 */
function statusesReducer(statuses = {}, action) {
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
