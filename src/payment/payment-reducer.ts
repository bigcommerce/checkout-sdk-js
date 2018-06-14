import { combineReducers } from '@bigcommerce/data-store';

import { PaymentAction, PaymentActionType } from './payment-actions';
import PaymentResponseBody from './payment-response-body';
import PaymentState from './payment-state';

export default function paymentReducer(state: PaymentState = {}, action: PaymentAction): PaymentState {
    const reducer = combineReducers<PaymentState, PaymentAction>({
        data: dataReducer,
    });

    return reducer(state, action);
}

function dataReducer(data: PaymentResponseBody | undefined, action: PaymentAction): PaymentResponseBody | undefined {
    switch (action.type) {
    case PaymentActionType.SubmitPaymentSucceeded:
        return action.payload;

    default:
        return data;
    }
}
