import { combineReducers } from '@bigcommerce/data-store';
import * as actionTypes from './payment-action-types';

/**
 * @param {PaymentState} state
 * @param {Action} action
 * @return {PaymentState}
 */
export default function paymentReducer(state = {}, action) {
    const reducer = combineReducers({
        data: dataReducer,
    });

    return reducer(state, action);
}

/**
 * @private
 * @param {PaymentResponseBody} data
 * @param {Action} action
 * @return {PaymentResponseBody}
 */
function dataReducer(data = {}, action) {
    switch (action.type) {
    case actionTypes.SUBMIT_PAYMENT_SUCCEEDED:
        return action.payload;

    default:
        return data;
    }
}
