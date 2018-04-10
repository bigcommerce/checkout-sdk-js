import { combineReducers, Action } from '@bigcommerce/data-store';

import * as actionTypes from './payment-action-types';

/**
 * @todo Convert this file into TypeScript properly
 * @param {PaymentState} state
 * @param {Action} action
 * @return {PaymentState}
 */
export default function paymentReducer(state: any = {}, action: Action): any {
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
function dataReducer(data: any = {}, action: Action): any {
    switch (action.type) {
    case actionTypes.SUBMIT_PAYMENT_SUCCEEDED:
        return action.payload;

    default:
        return data;
    }
}
