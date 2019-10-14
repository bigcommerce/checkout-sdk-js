import { createAction } from '@bigcommerce/data-store';
import { createRequestSender, Response } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { merge, omit } from 'lodash';
import { from, of } from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';

import { getCart, getCartState } from '../cart/carts.mock';
import { createCheckoutStore, CheckoutRequestSender, CheckoutStore, CheckoutStoreState, CheckoutValidator } from '../checkout';
import { getCheckout, getCheckoutStoreState } from '../checkout/checkouts.mock';
import { ErrorResponseBody } from '../common/error';
import { MissingDataError } from '../common/error/errors';
import { InternalResponseBody } from '../common/http-request';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';
import { getConfig, getConfigState } from '../config/configs.mock';

import { InternalOrderResponseBody } from './internal-order-responses';
import { getCompleteOrderResponseBody, getInternalOrderRequestBody, getOrderRequestBody, getSubmitOrderResponseBody, getSubmitOrderResponseHeaders } from './internal-orders.mock';
import Order from './order';
import OrderActionCreator from './order-action-creator';
import { OrderActionType } from './order-actions';
import OrderRequestSender from './order-request-sender';
import { getOrder, getOrderState } from './orders.mock';
import { createSpamProtection, SpamProtectionActionCreator, SpamProtectionActionType } from './spam-protection';

describe('OrderActionCreator', () => {
    let orderRequestSender: OrderRequestSender;
    let checkoutValidator: CheckoutValidator;
    let checkoutRequestSender: CheckoutRequestSender;
    let orderActionCreator: OrderActionCreator;
    let spamProtectionActionCreator: SpamProtectionActionCreator;
    let state: CheckoutStoreState;
    let store: CheckoutStore;

    beforeEach(() => {
        state = {
            ...getCheckoutStoreState(),
            order: {
                errors: {},
                meta: {
                    spamProtectionToken: 'spamProtectionToken',
                },
                statuses: {},
            },
        };
        store = createCheckoutStore(state);

        jest.spyOn(store, 'dispatch');

        orderRequestSender = new OrderRequestSender(createRequestSender());
        checkoutRequestSender = new CheckoutRequestSender(createRequestSender());
        checkoutValidator = new CheckoutValidator(checkoutRequestSender);
        spamProtectionActionCreator = new SpamProtectionActionCreator(createSpamProtection(createScriptLoader()));

        jest.spyOn(orderRequestSender, 'loadOrder').mockReturnValue({});
        jest.spyOn(orderRequestSender, 'submitOrder').mockReturnValue({});
        jest.spyOn(orderRequestSender, 'finalizeOrder').mockReturnValue({});

        jest.spyOn(checkoutValidator, 'validate')
            .mockReturnValue(Promise.resolve());

        jest.spyOn(spamProtectionActionCreator, 'execute').mockReturnValue(from([
            createAction(SpamProtectionActionType.ExecuteRequested),
            createAction(SpamProtectionActionType.Completed, { token: 'spamProtectionToken' }),
        ]));

        orderActionCreator = new OrderActionCreator(orderRequestSender, checkoutValidator, spamProtectionActionCreator);
    });

    describe('#loadOrder()', () => {
        beforeEach(() => {
            jest.spyOn(orderRequestSender, 'loadOrder')
                .mockReturnValue(Promise.resolve(getResponse(getOrder())));
        });

        it('emits actions if able to load order', async () => {
            const actions = await orderActionCreator.loadOrder(295)
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: OrderActionType.LoadOrderRequested },
                { type: OrderActionType.LoadOrderSucceeded, payload: getOrder() },
            ]);
        });

        it('emits actions if unable to load order', async () => {
            jest.spyOn(orderRequestSender, 'loadOrder')
                .mockReturnValue(Promise.reject(getErrorResponse()));

            const errorHandler = jest.fn(action => of(action));
            const actions = await orderActionCreator.loadOrder(0)
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
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
            jest.spyOn(orderRequestSender, 'loadOrder')
                .mockReturnValue(Promise.resolve(getResponse(getOrder())));
        });

        it('loads order by using order id from order object', async () => {
            await from(orderActionCreator.loadCurrentOrder()(store))
                .toPromise();

            expect(orderRequestSender.loadOrder).toHaveBeenCalledWith(295, undefined);
        });

        it('loads order by using order id from checkout object if order object is unavailable', async () => {
            store = createCheckoutStore({
                ...state,
                checkout: undefined,
                order: getOrderState(),
            });

            await from(orderActionCreator.loadCurrentOrder()(store))
                .toPromise();

            expect(orderRequestSender.loadOrder).toHaveBeenCalledWith(295, undefined);
        });

        it('throws error if there is no existing order id', async () => {
            store = createCheckoutStore();

            try {
                await from(orderActionCreator.loadCurrentOrder()(store))
                    .toPromise();
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('loads order only when action is dispatched', async () => {
            const action = orderActionCreator.loadCurrentOrder()(store);

            expect(orderRequestSender.loadOrder).not.toHaveBeenCalled();

            await store.dispatch(action);

            expect(orderRequestSender.loadOrder).toHaveBeenCalled();
        });
    });

    describe('#loadOrderPayments()', () => {
        beforeEach(() => {
            jest.spyOn(orderRequestSender, 'loadOrder')
                .mockReturnValue(Promise.resolve(getResponse(getOrder())));
        });

        it('emits actions if able to load order', async () => {
            const actions = await orderActionCreator.loadOrderPayments(295)
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: OrderActionType.LoadOrderPaymentsRequested },
                { type: OrderActionType.LoadOrderPaymentsSucceeded, payload: getOrder() },
            ]);
        });

        it('emits actions if unable to load order', async () => {
            jest.spyOn(orderRequestSender, 'loadOrder')
                .mockReturnValue(Promise.reject(getErrorResponse()));

            const errorHandler = jest.fn(action => of(action));
            const actions = await orderActionCreator.loadOrderPayments(295)
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
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

            expect(orderRequestSender.loadOrder).toHaveBeenCalledWith(295, undefined);
        });

        it('loads order by using order id from checkout object if order object is unavailable', async () => {
            store = createCheckoutStore({
                ...state,
                checkout: undefined,
                order: getOrderState(),
            });

            await orderActionCreator.loadOrderPayments(295)
                .toPromise();

            expect(orderRequestSender.loadOrder).toHaveBeenCalledWith(295, undefined);
        });

        it('loads order only when action is dispatched', async () => {
            const action = orderActionCreator.loadOrderPayments(295);

            expect(orderRequestSender.loadOrder).not.toHaveBeenCalled();

            await store.dispatch(action);

            expect(orderRequestSender.loadOrder).toHaveBeenCalled();
        });
    });

    describe('#submitOrder()', () => {
        let errorResponse: Response<ErrorResponseBody>;
        let loadResponse: Response<Order>;
        let submitResponse: Response<InternalResponseBody>;

        beforeEach(() => {
            loadResponse = getResponse(getOrder());
            submitResponse = getResponse(getSubmitOrderResponseBody(), getSubmitOrderResponseHeaders());
            errorResponse = getErrorResponse();

            jest.spyOn(checkoutRequestSender, 'loadCheckout')
                .mockReturnValue(Promise.resolve(getResponse(getCheckout())));

            jest.spyOn(orderRequestSender, 'loadOrder')
                .mockReturnValue(Promise.resolve(loadResponse));

            jest.spyOn(orderRequestSender, 'submitOrder')
                .mockReturnValue(Promise.resolve(submitResponse));
        });

        it('emits actions if able to submit order', async () => {
            const actions = await from(orderActionCreator.submitOrder(getOrderRequestBody())(store))
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: OrderActionType.SubmitOrderRequested },
                { type: OrderActionType.LoadOrderRequested },
                { type: OrderActionType.LoadOrderSucceeded, payload: getOrder() },
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
            jest.spyOn(orderRequestSender, 'submitOrder').mockReturnValue(Promise.reject(errorResponse));

            const errorHandler = jest.fn(action => of(action));
            const actions = await from(orderActionCreator.submitOrder(getOrderRequestBody())(store))
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: OrderActionType.SubmitOrderRequested },
                { type: OrderActionType.SubmitOrderFailed, payload: errorResponse, error: true },
            ]);
        });

        it('verifies cart content', async () => {
            await from(orderActionCreator.submitOrder(getOrderRequestBody())(store))
                .toPromise();

            expect(checkoutValidator.validate).toHaveBeenCalled();
        });

        it('throws error if spam protection is enabled but no token is provided', async () => {
            state = {
                ...getCheckoutStoreState(),
                order: {
                    errors: {},
                    meta: {},
                    statuses: {},
                },
            };
            store = createCheckoutStore(state);

            try {
                await from(orderActionCreator.submitOrder(getOrderRequestBody())(store))
                    .toPromise();
            } catch (error) {
                expect(error.payload).toBeInstanceOf(MissingDataError);
            }
        });

        it('submits order payload with payment data', async () => {
            await from(orderActionCreator.submitOrder(getOrderRequestBody())(store))
                .toPromise();

            expect(orderRequestSender.submitOrder).toHaveBeenCalledWith(getInternalOrderRequestBody(), undefined);
        });

        it('submits order payload without payment data', async () => {
            await from(orderActionCreator.submitOrder(omit(getOrderRequestBody(), 'payment'))(store))
                .toPromise();

            expect(orderRequestSender.submitOrder).toHaveBeenCalledWith(omit(getInternalOrderRequestBody(), 'payment'), undefined);
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
                await from(orderActionCreator.submitOrder(getOrderRequestBody())(store)).toPromise();
            } catch (action) {
                expect(orderRequestSender.submitOrder).not.toHaveBeenCalled();
                expect(action.payload).toEqual('foo');
            }
        });

        it('loads current order after order submission', async () => {
            await from(orderActionCreator.submitOrder(getOrderRequestBody())(store))
                .toPromise();

            expect(orderRequestSender.loadOrder).toHaveBeenCalledWith(295, undefined);
        });
    });

    describe('#finalizeOrder()', () => {
        let errorResponse: Response<ErrorResponseBody>;
        let response: Response<InternalOrderResponseBody>;

        beforeEach(() => {
            response = getResponse(getCompleteOrderResponseBody());
            errorResponse = getErrorResponse();

            jest.spyOn(orderRequestSender, 'loadOrder')
                .mockReturnValue(Promise.resolve(getResponse(getOrder())));
        });

        it('emits actions if able to finalize order', async () => {
            jest.spyOn(orderRequestSender, 'finalizeOrder')
                .mockReturnValue(Promise.resolve(response));

            const actions = await orderActionCreator.finalizeOrder(295)
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: OrderActionType.FinalizeOrderRequested },
                { type: OrderActionType.LoadOrderRequested },
                { type: OrderActionType.LoadOrderSucceeded, payload: getOrder() },
                { type: OrderActionType.FinalizeOrderSucceeded, payload: response.body.data },
            ]);
        });

        it('emits error actions if unable to finalize order', async () => {
            jest.spyOn(orderRequestSender, 'finalizeOrder')
                .mockReturnValue(Promise.reject(errorResponse));

            const errorHandler = jest.fn(action => of(action));
            const actions = await orderActionCreator.finalizeOrder(0)
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: OrderActionType.FinalizeOrderRequested },
                { type: OrderActionType.FinalizeOrderFailed, payload: errorResponse, error: true },
            ]);
        });
    });

    describe('#executeSpamProtection()', () => {
        it('emits actions if able to execute spam protection', async () => {
            const actions = await from(orderActionCreator.executeSpamProtection()(store))
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: SpamProtectionActionType.ExecuteRequested },
                { type: SpamProtectionActionType.Completed, payload: { token: 'spamProtectionToken' } },
            ]);
        });

        it('does not emit actions if spam protection is disabled', async () => {
            const config = getConfig();
            config.storeConfig.checkoutSettings.isSpamProtectionEnabled = false;
            const configState = {
                ...getConfigState(),
                data: config,
            };
            const state = {
                ...getCheckoutStoreState(),
                config: configState,
            };

            const store = createCheckoutStore(state);

            const actions = await from(orderActionCreator.executeSpamProtection()(store))
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([]);
        });
    });
});
