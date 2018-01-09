import { getPaymentResponseBody } from './payments.mock';
import { getErrorResponseBody } from '../common/http-request/responses.mock';
import * as actionTypes from './payment-action-types';
import paymentReducer from './payment-reducer';

describe('paymentReducer', () => {
    let initialState;

    beforeEach(() => {
        initialState = {};
    });

    it('returns new data while submitting payment', () => {
        const action = {
            type: actionTypes.SUBMIT_PAYMENT_REQUESTED,
        };

        expect(paymentReducer(initialState, action)).toEqual(expect.objectContaining({
            statuses: { isSubmitting: true },
        }));
    });

    it('returns new data if payment is submitted successfully', () => {
        const action = {
            type: actionTypes.SUBMIT_PAYMENT_SUCCEEDED,
            payload: getPaymentResponseBody(),
        };

        expect(paymentReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload,
            statuses: { isSubmitting: false },
        }));
    });

    it('returns new data if payment is not submitted successfully', () => {
        const action = {
            type: actionTypes.SUBMIT_PAYMENT_FAILED,
            payload: getErrorResponseBody(),
            error: true,
        };

        expect(paymentReducer(initialState, action)).toEqual(expect.objectContaining({
            errors: { submitError: action.payload },
            statuses: { isSubmitting: false },
        }));
    });
});
