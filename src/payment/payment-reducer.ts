import { combineReducers, Action } from '@bigcommerce/data-store';

import * as actionTypes from './payment-action-types';
import PaymentResponseBody from './payment-response-body';
import PaymentState from './payment-state';

/**
 * @todo Convert this file into TypeScript properly
 * i.e.: Action
 */
export default function paymentReducer(state: PaymentState = {}, action: Action): PaymentState {
    const reducer = combineReducers<PaymentState>({
        data: dataReducer,
    });

    return reducer(state, action);
}

function dataReducer(data: PaymentResponseBody | undefined, action: Action): PaymentResponseBody | undefined {
    switch (action.type) {
    case actionTypes.SUBMIT_PAYMENT_SUCCEEDED:
        return action.payload;

    default:
        return data;
    }
}
