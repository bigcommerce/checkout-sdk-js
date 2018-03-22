import { getPaymentResponseBody } from './payments.mock';
import * as actionTypes from './payment-action-types';
import paymentReducer from './payment-reducer';

describe('paymentReducer', () => {
    let initialState;

    beforeEach(() => {
        initialState = {};
    });

    it('returns new data if payment is submitted successfully', () => {
        const action = {
            type: actionTypes.SUBMIT_PAYMENT_SUCCEEDED,
            payload: getPaymentResponseBody(),
        };

        expect(paymentReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload,
        }));
    });
});
