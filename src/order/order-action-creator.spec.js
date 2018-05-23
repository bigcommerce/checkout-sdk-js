import { merge } from 'lodash';
import { Observable } from 'rxjs';
import { createCheckoutStore } from '../checkout';
import {
    getCompleteOrderResponseBody,
    getOrderRequestBody,
    getSubmitOrderResponseBody,
    getSubmitOrderResponseHeaders,
} from './internal-orders.mock';
import { getCart, getCartState } from '../cart/internal-carts.mock';
import { getConfigState } from '../config/configs.mock';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';
import OrderActionCreator from './order-action-creator';
import { getOrder } from './orders.mock';
import { OrderActionType } from './order-actions';
import CheckoutRequestSender from '../checkout/checkout-request-sender';
import { createRequestSender } from '@bigcommerce/request-sender';
import CheckoutValidator from '../checkout/checkout-validator';
import { getCheckout } from '../checkout/checkouts.mock';

describe('OrderActionCreator', () => {
    let checkoutClient;
    let checkoutValidator;
    let checkoutRequestSender;
    let orderActionCreator;
    let store;

    beforeEach(() => {
        store = createCheckoutStore({
            cart: getCartState(),
            config: getConfigState(),
        });

        jest.spyOn(store, 'dispatch');

        checkoutRequestSender = new CheckoutRequestSender(createRequestSender());
        checkoutValidator = new CheckoutValidator(checkoutRequestSender);

        checkoutClient = {
            loadOrder: jest.fn(() => {}),
            submitOrder: jest.fn(() => {}),
            finalizeOrder: jest.fn(() => {}),
        };

        jest.spyOn(checkoutClient, 'loadOrder')
            .mockReturnValue(Promise.resolve(getResponse(getOrder())));

        jest.spyOn(checkoutValidator, 'validate')
            .mockReturnValue(Promise.resolve());

        orderActionCreator = new OrderActionCreator(checkoutClient, checkoutValidator);
    });

    describe('#loadOrder()', () => {
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

    describe('#submitOrder()', () => {
        let errorResponse;
        let loadResponse;
        let submitResponse;

        beforeEach(() => {
            loadResponse = getResponse(getCompleteOrderResponseBody());
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

        it('does not submit order if cart verification fails', async () => {
            jest.spyOn(checkoutValidator, 'validate')
                .mockReturnValue(Promise.reject('foo'));

            store = createCheckoutStore({
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
