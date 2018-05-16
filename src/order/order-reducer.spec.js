import { getCompleteOrderResponseBody, getSubmitOrderResponseBody, getSubmitOrderResponseHeaders } from './internal-orders.mock';
import { getOrder } from './orders.mock';
import { getErrorResponse } from '../common/http-request/responses.mock';
import { getQuoteResponseBody } from '../quote/internal-quotes.mock';
import * as quoteActionTypes from '../quote/quote-action-types';
import { OrderActionType } from './order-actions';
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
            type: OrderActionType.LoadOrderRequested,
        };

        expect(orderReducer(initialState, action)).toEqual(expect.objectContaining({
            statuses: { isLoading: true },
        }));
    });

    it('returns new data if it is fetched successfully', () => {
        const action = {
            type: OrderActionType.LoadOrderSucceeded,
            payload: getOrder(),
        };

        initialState = {
            data: getCompleteOrderResponseBody().data.order,
        };

        expect(orderReducer(initialState, action)).toEqual(expect.objectContaining({
            data: initialState.data,
            statuses: { isLoading: false },
        }));
    });

    it('returns new data if it is not fetched successfully', () => {
        const response = getErrorResponse();
        const action = {
            type: OrderActionType.LoadOrderFailed,
            payload: response.data,
        };

        expect(orderReducer(initialState, action)).toEqual(expect.objectContaining({
            errors: { loadError: action.payload },
            statuses: { isLoading: false },
        }));
    });

    it('returns new data if it is submitted successfully', () => {
        const response = getSubmitOrderResponseBody();
        const headers = getSubmitOrderResponseHeaders();
        const action = {
            type: OrderActionType.SubmitOrderSucceeded,
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
                payment: action.payload.order.payment,
            }),
            data: action.payload.order,
        }));
    });

    it('returns new data if it is finalized successfully', () => {
        const response = getCompleteOrderResponseBody();
        const action = {
            type: OrderActionType.FinalizeOrderSucceeded,
            meta: response.meta,
            payload: response.data,
        };

        expect(orderReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.order,
        }));
    });
});
