import { createAction } from '@bigcommerce/data-store';

import { PaymentActionType } from './payment-actions';
import paymentReducer from './payment-reducer';
import { getPaymentResponseBody } from './payments.mock';

describe('paymentReducer', () => {
    let initialState;

    beforeEach(() => {
        initialState = {};
    });

    it('returns new data if payment is submitted successfully', () => {
        const action = createAction(PaymentActionType.SubmitPaymentSucceeded, getPaymentResponseBody());

        expect(paymentReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload,
        }));
    });
});
