import { Observable } from 'rxjs';
import {
    getCompleteOrderResponseBody,
    getOrderRequestBody,
    getSubmitOrderResponseBody,
    getSubmitOrderResponseHeaders,
} from './orders.mock';
import { getCart, getCartResponseBody } from '../cart/carts.mock';
import { getConfigState } from '../config/configs.mock';
import { getErrorResponseBody } from '../common/error/errors.mock';
import { getErrorResponse, getResponse } from '../../http-request/responses.mock';
import * as actionTypes from './order-action-types';
import createCheckoutStore from '../create-checkout-store';
import OrderActionCreator from './order-action-creator';

describe('OrderActionCreator', () => {
    let checkoutClient;
    let orderActionCreator;
    let store;

    beforeEach(() => {
        store = createCheckoutStore({
            config: getConfigState(),
        });

        jest.spyOn(store, 'dispatch');
    });

    describe('#loadOrder()', () => {
        let errorResponse;
        let response;

        beforeEach(() => {
            response = getResponse(getCompleteOrderResponseBody());
            errorResponse = getErrorResponse(getErrorResponseBody());

            checkoutClient = {
                loadOrder: jest.fn(() => Promise.resolve(response)),
            };

            orderActionCreator = new OrderActionCreator(checkoutClient);
        });

        it('emits actions if able to load order', () => {
            orderActionCreator.loadOrder(295)
                .toArray()
                .subscribe((actions) => {
                    expect(actions).toEqual([
                        { type: actionTypes.LOAD_ORDER_REQUESTED },
                        { type: actionTypes.LOAD_ORDER_SUCCEEDED, payload: response.body.data },
                    ]);
                });
        });

        it('emits actions if unable to load order', () => {
            checkoutClient.loadOrder.mockReturnValue(Promise.reject(errorResponse));

            const errorHandler = jest.fn((action) => Observable.of(action));

            orderActionCreator.loadOrder()
                .catch(errorHandler)
                .toArray()
                .subscribe((actions) => {
                    expect(errorHandler).toHaveBeenCalled();
                    expect(actions).toEqual([
                        { type: actionTypes.LOAD_ORDER_REQUESTED },
                        { type: actionTypes.LOAD_ORDER_FAILED, payload: errorResponse, error: true },
                    ]);
                });
        });
    });

    describe('#submitOrder()', () => {
        let errorResponse;
        let loadResponse;
        let submitResponse;

        beforeEach(() => {
            loadResponse = getResponse(getCompleteOrderResponseBody());
            submitResponse = getResponse(getSubmitOrderResponseBody(), getSubmitOrderResponseHeaders());
            errorResponse = getErrorResponse(getErrorResponseBody());

            checkoutClient = {
                loadCart: jest.fn(() => Promise.resolve(getResponse(getCartResponseBody()))),
                loadOrder: jest.fn(() => Promise.resolve(loadResponse)),
                submitOrder: jest.fn(() => Promise.resolve(submitResponse)),
            };

            orderActionCreator = new OrderActionCreator(checkoutClient);
        });

        it('emits actions if able to submit order', () => {
            orderActionCreator.submitOrder(getOrderRequestBody())
                .toArray()
                .subscribe((actions) => {
                    expect(actions).toEqual([
                        { type: actionTypes.SUBMIT_ORDER_REQUESTED },
                        {
                            type: actionTypes.SUBMIT_ORDER_SUCCEEDED,
                            payload: submitResponse.body.data,
                            meta: {
                                ...submitResponse.body.meta,
                                token: submitResponse.headers.token,
                            },
                        },
                    ]);
                });
        });

        it('emits error actions if unable to submit order', () => {
            checkoutClient.submitOrder.mockReturnValue(Promise.reject(errorResponse));

            const errorHandler = jest.fn((action) => Observable.of(action));

            orderActionCreator.submitOrder(getOrderRequestBody())
                .catch(errorHandler)
                .toArray()
                .subscribe((actions) => {
                    expect(errorHandler).toHaveBeenCalled();
                    expect(actions).toEqual([
                        { type: actionTypes.SUBMIT_ORDER_REQUESTED },
                        { type: actionTypes.SUBMIT_ORDER_FAILED, payload: errorResponse, error: true },
                    ]);
                });
        });

        it('verifies cart content', async () => {
            await orderActionCreator.submitOrder(getOrderRequestBody(), getCart()).toPromise();

            expect(checkoutClient.loadCart).toHaveBeenCalled();
        });

        it('does not submit order if cart verification fails', async () => {
            try {
                await orderActionCreator.submitOrder(getOrderRequestBody(), { ...getCart(), currency: 'JPY' }).toPromise();
            } catch (action) {
                expect(checkoutClient.submitOrder).not.toHaveBeenCalled();
                expect(action.payload.body.type).toEqual('changed_cart');
            }
        });
    });

    describe('#finalizeOrder()', () => {
        let errorResponse;
        let response;

        beforeEach(() => {
            response = getResponse(getCompleteOrderResponseBody());
            errorResponse = getErrorResponse(getErrorResponseBody());

            checkoutClient = {
                finalizeOrder: jest.fn(() => Promise.resolve(response)),
            };

            orderActionCreator = new OrderActionCreator(checkoutClient);
        });

        it('emits actions if able to finalize order', () => {
            orderActionCreator.finalizeOrder(295)
                .toArray()
                .subscribe((actions) => {
                    expect(actions).toEqual([
                        { type: actionTypes.FINALIZE_ORDER_REQUESTED },
                        { type: actionTypes.FINALIZE_ORDER_SUCCEEDED, payload: response.body.data },
                    ]);
                });
        });

        it('emits error actions if unable to finalize order', () => {
            checkoutClient.finalizeOrder.mockReturnValue(Promise.reject(errorResponse));

            const errorHandler = jest.fn((action) => Observable.of(action));

            orderActionCreator.finalizeOrder()
                .catch(errorHandler)
                .toArray()
                .subscribe((actions) => {
                    expect(errorHandler).toHaveBeenCalled();
                    expect(actions).toEqual([
                        { type: actionTypes.FINALIZE_ORDER_REQUESTED },
                        { type: actionTypes.FINALIZE_ORDER_FAILED, payload: errorResponse, error: true },
                    ]);
                });
        });
    });
});
