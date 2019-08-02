import { createErrorAction } from '@bigcommerce/data-store';
import { omit } from 'lodash';

import { RequestErrorFactory } from '../common/error';
import { getErrorResponse } from '../common/http-request/responses.mock';

import { getCompleteOrderResponseBody, getSubmitOrderResponseBody, getSubmitOrderResponseHeaders } from './internal-orders.mock';
import { FinalizeOrderAction, LoadOrderAction, LoadOrderPaymentsAction, OrderActionType, SubmitOrderAction } from './order-actions';
import orderReducer from './order-reducer';
import OrderState from './order-state';
import { getOrder } from './orders.mock';
import { SpamProtectionAction, SpamProtectionActionType } from './spam-protection';

describe('orderReducer()', () => {
    let initialState: OrderState;

    beforeEach(() => {
        initialState = {
            errors: {},
            statuses: {},
        };
    });

    it('returns new status while fetching order', () => {
        const action: LoadOrderAction = {
            type: OrderActionType.LoadOrderRequested,
        };

        expect(orderReducer(initialState, action)).toEqual(expect.objectContaining({
            statuses: { isLoading: true },
        }));
    });

    it('returns new data if it is fetched successfully', () => {
        const action: LoadOrderAction = {
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
        const action = createErrorAction(
            OrderActionType.LoadOrderFailed,
            new RequestErrorFactory().createError(response)
        );

        expect(orderReducer(initialState, action)).toEqual(expect.objectContaining({
            errors: { loadError: action.payload },
            statuses: { isLoading: false },
        }));
    });

    it('returns new data if it is submitted successfully', () => {
        const response = getSubmitOrderResponseBody();
        const headers = getSubmitOrderResponseHeaders();
        const action: SubmitOrderAction = {
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
                // tslint:disable-next-line:no-non-null-assertion
                payment: action.payload!.order.payment,
                token: headers.token,
            },
        }));
    });

    it('returns new data if it is finalized successfully', () => {
        const response = getCompleteOrderResponseBody();
        const action: FinalizeOrderAction = {
            type: OrderActionType.FinalizeOrderSucceeded,
            meta: response.meta,
            payload: response.data,
        };

        expect(orderReducer(initialState, action)).toEqual(expect.objectContaining({
            meta: {
                // tslint:disable-next-line:no-non-null-assertion
                payment: action.payload!.order.payment,
            },
        }));
    });

    it('returns new data if spam protection completed successfully', () => {
        const action: SpamProtectionAction = {
            type: SpamProtectionActionType.Completed,
            payload: 'spamProtectionToken',
        };

        expect(orderReducer(initialState, action)).toEqual(expect.objectContaining({
            meta: {
                spamProtectionToken: action.payload,
            },
        }));
    });

    describe('loadOrderPayments', () => {
        it('returns new status while fetching order', () => {
            const action: LoadOrderPaymentsAction = {
                type: OrderActionType.LoadOrderPaymentsRequested,
            };

            expect(orderReducer(initialState, action)).toEqual(expect.objectContaining({
                statuses: { isLoading: true },
            }));
        });

        it('returns new data if it is fetched successfully', () => {
            const action: LoadOrderPaymentsAction = {
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
            const action = createErrorAction(
                OrderActionType.LoadOrderPaymentsFailed,
                new RequestErrorFactory().createError(response)
            );

            expect(orderReducer(initialState, action)).toEqual(expect.objectContaining({
                errors: { loadError: action.payload },
                statuses: { isLoading: false },
            }));
        });
    });
});
