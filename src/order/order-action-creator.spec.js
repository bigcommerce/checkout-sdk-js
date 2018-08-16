import { createRequestSender } from '@bigcommerce/request-sender';
import { omit, merge } from 'lodash';
import { Observable } from 'rxjs';

import { getCart, getCartState } from '../cart/internal-carts.mock';
import { CheckoutRequestSender, CheckoutValidator, createCheckoutStore } from '../checkout';
import { getCheckout, getCheckoutStoreState } from '../checkout/checkouts.mock';
import { MissingDataError } from '../common/error/errors';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';
import { getConfigState } from '../config/configs.mock';

import {
    getCompleteOrderResponseBody,
    getInternalOrderRequestBody,
    getOrderRequestBody,
    getSubmitOrderResponseBody,
    getSubmitOrderResponseHeaders,
} from './internal-orders.mock';
import OrderActionCreator from './order-action-creator';
import { OrderActionType } from './order-actions';
import { getOrder, getOrderState } from './orders.mock';

describe('OrderActionCreator', () => {
    let checkoutClient;
    let checkoutValidator;
    let checkoutRequestSender;
    let orderActionCreator;
    let state;
    let store;

    beforeEach(() => {
        state = getCheckoutStoreState();
        store = createCheckoutStore(state);

        jest.spyOn(store, 'dispatch');

        checkoutRequestSender = new CheckoutRequestSender(createRequestSender());
        checkoutValidator = new CheckoutValidator(checkoutRequestSender);

        checkoutClient = {
            loadOrder: jest.fn(() => {}),
            submitOrder: jest.fn(() => {}),
            finalizeOrder: jest.fn(() => {}),
        };

        jest.spyOn(checkoutValidator, 'validate')
            .mockReturnValue(Promise.resolve());

        orderActionCreator = new OrderActionCreator(checkoutClient, checkoutValidator);
    });

    describe('#loadOrder()', () => {
        beforeEach(() => {
            jest.spyOn(checkoutClient, 'loadOrder')
                .mockReturnValue(Promise.resolve(getResponse(getOrder())));
        });

        it('emits actions if able to load order', async () => {
            const actions = await orderActionCreator.loadOrder(295)
                .toArray()
                .toPromise();

            expect(actions).toEqual([
                { type: OrderActionType.LoadOrderRequested },
                { type: OrderActionType.LoadOrderSucceeded, payload: getOrder() },
            ]);
        });

        it('emits actions if unable to load order', async () => {
            jest.spyOn(checkoutClient, 'loadOrder')
                .mockReturnValue(Promise.reject(getErrorResponse()));

            const errorHandler = jest.fn((action) => Observable.of(action));
            const actions = await orderActionCreator.loadOrder()
                .catch(errorHandler)
                .toArray()
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: OrderActionType.LoadOrderRequested },
                { type: OrderActionType.LoadOrderFailed, payload: getErrorResponse(), error: true },
            ]);
        });
    });

    describe('#loadCurrentOrder()', () => {
        beforeEach(() => {
            jest.spyOn(checkoutClient, 'loadOrder')
                .mockReturnValue(Promise.resolve(getResponse(getOrder())));
        });

        it('loads order by using order id from order object', async () => {
            await orderActionCreator.loadCurrentOrder()(store)
                .toPromise();

            expect(checkoutClient.loadOrder).toHaveBeenCalledWith(295, undefined);
        });

        it('loads order by using order id from checkout object if order object is unavailable', async () => {
            store = createCheckoutStore({
                ...state,
                checkout: undefined,
                order: getOrderState(),
            });

            await orderActionCreator.loadCurrentOrder()(store)
                .toPromise();

            expect(checkoutClient.loadOrder).toHaveBeenCalledWith(295, undefined);
        });

        it('throws error if there is no existing order id', async () => {
            store = createCheckoutStore();

            try {
                await orderActionCreator.loadCurrentOrder()(store)
                    .toPromise();
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('loads order only when action is dispatched', async () => {
            const action = orderActionCreator.loadCurrentOrder()(store);

            expect(checkoutClient.loadOrder).not.toHaveBeenCalled();

            await store.dispatch(action);

            expect(checkoutClient.loadOrder).toHaveBeenCalled();
        });
    });

    describe('#loadOrderPayments()', () => {
        beforeEach(() => {
            jest.spyOn(checkoutClient, 'loadOrder')
                .mockReturnValue(Promise.resolve(getResponse(getOrder())));
        });

        it('emits actions if able to load order', async () => {
            const actions = await orderActionCreator.loadOrderPayments(295)
                .toArray()
                .toPromise();

            expect(actions).toEqual([
                { type: OrderActionType.LoadOrderPaymentsRequested },
                { type: OrderActionType.LoadOrderPaymentsSucceeded, payload: getOrder() },
            ]);
        });

        it('emits actions if unable to load order', async () => {
            jest.spyOn(checkoutClient, 'loadOrder')
                .mockReturnValue(Promise.reject(getErrorResponse()));

            const errorHandler = jest.fn((action) => Observable.of(action));
            const actions = await orderActionCreator.loadOrderPayments(295)
                .catch(errorHandler)
                .toArray()
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: OrderActionType.LoadOrderPaymentsRequested },
                { type: OrderActionType.LoadOrderPaymentsFailed, payload: getErrorResponse(), error: true },
            ]);
        });

        it('loads order by using order id from order object', async () => {
            await orderActionCreator.loadOrderPayments(295)
                .toPromise();

            expect(checkoutClient.loadOrder).toHaveBeenCalledWith(295, undefined);
        });

        it('loads order by using order id from checkout object if order object is unavailable', async () => {
            store = createCheckoutStore({
                ...state,
                checkout: undefined,
                order: getOrderState(),
            });

            await orderActionCreator.loadOrderPayments(295)
                .toPromise();

            expect(checkoutClient.loadOrder).toHaveBeenCalledWith(295, undefined);
        });

        it('loads order only when action is dispatched', async () => {
            const action = orderActionCreator.loadOrderPayments(295);

            expect(checkoutClient.loadOrder).not.toHaveBeenCalled();

            await store.dispatch(action);

            expect(checkoutClient.loadOrder).toHaveBeenCalled();
        });
    });

    describe('#submitOrder()', () => {
        let errorResponse;
        let loadResponse;
        let submitResponse;

        beforeEach(() => {
            loadResponse = getResponse(getOrder());
            submitResponse = getResponse(getSubmitOrderResponseBody(), getSubmitOrderResponseHeaders());
            errorResponse = getErrorResponse();

            jest.spyOn(checkoutRequestSender, 'loadCheckout')
                .mockReturnValue(Promise.resolve(getResponse(getCheckout())));

            jest.spyOn(checkoutClient, 'loadOrder')
                .mockReturnValue(Promise.resolve(loadResponse));

            jest.spyOn(checkoutClient, 'submitOrder')
                .mockReturnValue(Promise.resolve(submitResponse));
        });

        it('emits actions if able to submit order', async () => {
            const actions = await Observable.from(orderActionCreator.submitOrder(getOrderRequestBody())(store))
                .toArray()
                .toPromise();

            expect(actions).toEqual([
                { type: OrderActionType.SubmitOrderRequested },
                {
                    type: OrderActionType.SubmitOrderSucceeded,
                    payload: submitResponse.body.data,
                    meta: {
                        ...submitResponse.body.meta,
                        token: submitResponse.headers.token,
                    },
                },
                { type: OrderActionType.LoadOrderRequested },
                { type: OrderActionType.LoadOrderSucceeded, payload: getOrder() },
            ]);
        });

        it('emits error actions if unable to submit order', async () => {
            checkoutClient.submitOrder.mockReturnValue(Promise.reject(errorResponse));

            const errorHandler = jest.fn((action) => Observable.of(action));
            const actions = await Observable.from(orderActionCreator.submitOrder(getOrderRequestBody())(store))
                .catch(errorHandler)
                .toArray()
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: OrderActionType.SubmitOrderRequested },
                { type: OrderActionType.SubmitOrderFailed, payload: errorResponse, error: true },
            ]);
        });

        it('verifies cart content', async () => {
            await Observable.from(orderActionCreator.submitOrder(getOrderRequestBody())(store))
                .toPromise();

            expect(checkoutValidator.validate).toHaveBeenCalled();
        });

        it('submits order payload with payment data', async () => {
            await Observable.from(orderActionCreator.submitOrder(getOrderRequestBody())(store))
                .toPromise();

            expect(checkoutClient.submitOrder).toHaveBeenCalledWith(getInternalOrderRequestBody(), undefined);
        });

        it('submits order payload without payment data', async () => {
            await Observable.from(orderActionCreator.submitOrder(omit(getOrderRequestBody(), 'payment'))(store))
                .toPromise();

            expect(checkoutClient.submitOrder).toHaveBeenCalledWith(omit(getInternalOrderRequestBody(), 'payment'), undefined);
        });

        it('does not submit order if cart verification fails', async () => {
            jest.spyOn(checkoutValidator, 'validate')
                .mockReturnValue(Promise.reject('foo'));

            store = createCheckoutStore({
                ...state,
                cart: merge({}, getCartState(), { data: { ...getCart(), currency: 'JPY' } }),
                config: getConfigState(),
            });

            try {
                await Observable.from(orderActionCreator.submitOrder(getOrderRequestBody())(store)).toPromise();
            } catch (action) {
                expect(checkoutClient.submitOrder).not.toHaveBeenCalled();
                expect(action.payload).toEqual('foo');
            }
        });
    });

    describe('#finalizeOrder()', () => {
        let errorResponse;
        let response;

        beforeEach(() => {
            response = getResponse(getCompleteOrderResponseBody());
            errorResponse = getErrorResponse();

            jest.spyOn(checkoutClient, 'loadOrder')
                .mockReturnValue(Promise.resolve(getResponse(getOrder())));
        });

        it('emits actions if able to finalize order', async () => {
            jest.spyOn(checkoutClient, 'finalizeOrder')
                .mockReturnValue(Promise.resolve(response));

            const actions = await orderActionCreator.finalizeOrder(295)
                .toArray()
                .toPromise();

            expect(actions).toEqual([
                { type: OrderActionType.FinalizeOrderRequested },
                { type: OrderActionType.FinalizeOrderSucceeded, payload: response.body.data },
                { type: OrderActionType.LoadOrderRequested },
                { type: OrderActionType.LoadOrderSucceeded, payload: getOrder() },
            ]);
        });

        it('emits error actions if unable to finalize order', async () => {
            jest.spyOn(checkoutClient, 'finalizeOrder')
                .mockReturnValue(Promise.reject(errorResponse));

            const errorHandler = jest.fn((action) => Observable.of(action));
            const actions = await orderActionCreator.finalizeOrder()
                .catch(errorHandler)
                .toArray()
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: OrderActionType.FinalizeOrderRequested },
                { type: OrderActionType.FinalizeOrderFailed, payload: errorResponse, error: true },
            ]);
        });
    });
});
