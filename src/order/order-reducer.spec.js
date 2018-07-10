import { omit } from 'lodash';
import { getErrorResponse } from '../common/http-request/responses.mock';

import { getCompleteOrderResponseBody, getSubmitOrderResponseBody, getSubmitOrderResponseHeaders } from './internal-orders.mock';
import { getOrder, getOrderState } from './orders.mock';
import { OrderActionType } from './order-actions';
import orderReducer from './order-reducer';

describe('orderReducer()', () => {
    let initialState;

    beforeEach(() => {
        initialState = {};
    });

    it('returns new status while fetching order', () => {
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

        expect(orderReducer(initialState, action)).toEqual(expect.objectContaining({
            data: omit(action.payload, ['billingAddress', 'coupons']),
            statuses: { isLoading: false },
        }));
    });

    it('returns error if it is not fetched successfully', () => {
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
            meta: {
                callbackUrl: response.data.order.callbackUrl,
                deviceFingerprint: response.meta.deviceFingerprint,
                orderToken: response.data.order.token,
                payment: action.payload.order.payment,
                token: headers.token,
            },
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
            meta: {
                payment: action.payload.order.payment,
            },
        }));
    });

    it('cleans the order after a new order post', () => {
        const response = getCompleteOrderResponseBody();
        const action = {
            type: OrderActionType.SubmitOrderSucceeded,
            meta: response.meta,
            payload: response.data,
        };

        expect(orderReducer(getOrderState(), action)).toEqual(expect.objectContaining({
            data: undefined,
        }));
    });

    describe('loadOrderPayments', () => {
        it('returns new status while fetching order', () => {
            const action = {
                type: OrderActionType.LoadOrderPaymentsRequested,
            };

            expect(orderReducer(initialState, action)).toEqual(expect.objectContaining({
                statuses: { isLoading: true },
            }));
        });

        it('returns new data if it is fetched successfully', () => {
            const action = {
                type: OrderActionType.LoadOrderPaymentsSucceeded,
                payload: getOrder(),
            };

            expect(orderReducer(initialState, action)).toEqual(expect.objectContaining({
                data: omit(action.payload, ['billingAddress', 'coupons']),
                statuses: { isLoading: false },
            }));
        });

        it('returns error if it is not fetched successfully', () => {
            const response = getErrorResponse();
            const action = {
                type: OrderActionType.LoadOrderPaymentsFailed,
                payload: response.data,
            };

            expect(orderReducer(initialState, action)).toEqual(expect.objectContaining({
                errors: { loadError: action.payload },
                statuses: { isLoading: false },
            }));
        });
    });
});
