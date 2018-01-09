import { getCompleteOrderResponseBody, getSubmitOrderResponseBody, getSubmitOrderResponseHeaders } from './orders.mock';
import { getErrorResponseBody } from '../common/http-request/responses.mock';
import { getQuoteResponseBody } from '../quote/quotes.mock';
import * as orderActionTypes from './order-action-types';
import * as quoteActionTypes from '../quote/quote-action-types';
import orderReducer from './order-reducer';

describe('orderReducer()', () => {
    let initialState;

    beforeEach(() => {
        initialState = {};
    });

    it('returns new data if quote is fetched successfully', () => {
        const response = getQuoteResponseBody();
        const action = {
            type: quoteActionTypes.LOAD_QUOTE_SUCCEEDED,
            meta: response.meta,
            payload: response.data,
        };

        expect(orderReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.order,
        }));
    });

    it('returns new data while fetching order', () => {
        const action = {
            type: orderActionTypes.LOAD_ORDER_REQUESTED,
        };

        expect(orderReducer(initialState, action)).toEqual(expect.objectContaining({
            statuses: { isLoading: true },
        }));
    });

    it('returns new data if it is fetched successfully', () => {
        const response = getCompleteOrderResponseBody();
        const action = {
            type: orderActionTypes.LOAD_ORDER_SUCCEEDED,
            meta: response.meta,
            payload: response.data,
        };

        expect(orderReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.order,
            statuses: { isLoading: false },
        }));
    });

    it('returns new data if it is not fetched successfully', () => {
        const response = getErrorResponseBody();
        const action = {
            type: orderActionTypes.LOAD_ORDER_FAILED,
            payload: response.data,
        };

        expect(orderReducer(initialState, action)).toEqual(expect.objectContaining({
            errors: { loadError: action.payload },
            statuses: { isLoading: false },
        }));
    });

    it('returns new data while submitting order', () => {
        const action = {
            type: orderActionTypes.SUBMIT_ORDER_REQUESTED,
        };

        expect(orderReducer(initialState, action)).toEqual(expect.objectContaining({
            statuses: { isSubmitting: true },
        }));
    });

    it('returns new data if it is submitted successfully', () => {
        const response = getSubmitOrderResponseBody();
        const headers = getSubmitOrderResponseHeaders();
        const action = {
            type: orderActionTypes.SUBMIT_ORDER_SUCCEEDED,
            meta: {
                ...response.meta,
                token: headers.token,
            },
            payload: response.data,
        };

        expect(orderReducer(initialState, action)).toEqual(expect.objectContaining({
            meta: expect.objectContaining({
                deviceFingerprint: response.meta.deviceFingerprint,
                token: headers.token,
            }),
            data: action.payload.order,
            statuses: { isSubmitting: false },
        }));
    });

    it('returns new data if it is not submitted successfully', () => {
        const response = getErrorResponseBody();
        const action = {
            type: orderActionTypes.SUBMIT_ORDER_FAILED,
            payload: response.data,
        };

        expect(orderReducer(initialState, action)).toEqual(expect.objectContaining({
            errors: { submitError: action.payload },
            statuses: { isSubmitting: false },
        }));
    });

    it('returns new data while finalizing order', () => {
        const action = {
            type: orderActionTypes.FINALIZE_ORDER_REQUESTED,
        };

        expect(orderReducer(initialState, action)).toEqual(expect.objectContaining({
            statuses: { isFinalizing: true },
        }));
    });

    it('returns new data if it is finalized successfully', () => {
        const response = getCompleteOrderResponseBody();
        const action = {
            type: orderActionTypes.FINALIZE_ORDER_SUCCEEDED,
            meta: response.meta,
            payload: response.data,
        };

        expect(orderReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.order,
            statuses: { isFinalizing: false },
        }));
    });

    it('returns new data if it is not finalized successfully', () => {
        const response = getErrorResponseBody();
        const action = {
            type: orderActionTypes.FINALIZE_ORDER_FAILED,
            payload: response.data,
        };

        expect(orderReducer(initialState, action)).toEqual(expect.objectContaining({
            errors: { finalizeError: action.payload },
            statuses: { isFinalizing: false },
        }));
    });
});
