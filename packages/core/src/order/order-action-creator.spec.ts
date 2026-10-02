import { Action } from '@bigcommerce/data-store';
import { createRequestSender, Response } from '@bigcommerce/request-sender';
import { merge, omit } from 'lodash';
import { from, of } from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';

import { ErrorResponseBody } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { getCart, getCartState } from '../cart/carts.mock';
import { CartChangedError, CartConsistencyError } from '../cart/errors';
import {
    CheckoutRequestSender,
    CheckoutStore,
    CheckoutStoreState,
    CheckoutValidator,
    createCheckoutStore,
} from '../checkout';
import { getCheckout, getCheckoutState, getCheckoutStoreState } from '../checkout/checkouts.mock';
import { MissingDataError } from '../common/error/errors';
import { InternalResponseBody } from '../common/http-request';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';
import { getConfig, getConfigState } from '../config/configs.mock';
import { SpamProtectionNotCompletedError } from '../spam-protection/errors';

import { InternalOrderResponseBody } from './internal-order-responses';
import {
    getCompleteOrderResponseBody,
    getInternalOrderRequestBody,
    getOrderRequestBody,
    getSubmitOrderResponseBody,
    getSubmitOrderResponseHeaders,
} from './internal-orders.mock';
import Order from './order';
import OrderActionCreator, {
    RETURN_FULL_ORDER_DETAILS_ON_CREATE_ORDER,
    VALIDATE_CART_VERSION_ON_ORDER_CREATION,
} from './order-action-creator';
import { OrderActionType } from './order-actions';
import OrderRequestSender from './order-request-sender';
import { getOrder, getOrderState } from './orders.mock';

describe('OrderActionCreator', () => {
    let orderRequestSender: OrderRequestSender;
    let checkoutValidator: CheckoutValidator;
    let checkoutRequestSender: CheckoutRequestSender;
    let orderActionCreator: OrderActionCreator;
    let state: CheckoutStoreState;
    let store: CheckoutStore;

    beforeEach(() => {
        state = {
            ...getCheckoutStoreState(),
            order: {
                errors: {},
                meta: {},
                statuses: {},
            },
        };
        store = createCheckoutStore(state);

        jest.spyOn(store, 'dispatch');

        orderRequestSender = new OrderRequestSender(createRequestSender());
        checkoutRequestSender = new CheckoutRequestSender(createRequestSender());
        checkoutValidator = new CheckoutValidator(checkoutRequestSender);

        // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        jest.spyOn(orderRequestSender, 'loadOrder').mockReturnValue({});
        // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        jest.spyOn(orderRequestSender, 'submitOrder').mockReturnValue({});
        // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        jest.spyOn(orderRequestSender, 'finalizeOrder').mockReturnValue({});

        jest.spyOn(checkoutValidator, 'validate').mockReturnValue(Promise.resolve(getCheckout()));

        orderActionCreator = new OrderActionCreator(orderRequestSender, checkoutValidator);
    });

    describe('#loadOrder()', () => {
        beforeEach(() => {
            jest.spyOn(orderRequestSender, 'loadOrder').mockReturnValue(
                Promise.resolve(getResponse(getOrder())),
            );
        });

        it('emits actions if able to load order', async () => {
            const actions = await orderActionCreator.loadOrder(295).pipe(toArray()).toPromise();

            expect(actions).toEqual([
                { type: OrderActionType.LoadOrderRequested },
                { type: OrderActionType.LoadOrderSucceeded, payload: getOrder() },
            ]);
        });

        it('emits actions if unable to load order', async () => {
            jest.spyOn(orderRequestSender, 'loadOrder').mockReturnValue(
                Promise.reject(getErrorResponse()),
            );

            const errorHandler = jest.fn((action) => of(action));
            const actions = await orderActionCreator
                .loadOrder(0)
                .pipe(catchError(errorHandler), toArray())
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
            jest.spyOn(orderRequestSender, 'loadOrder').mockReturnValue(
                Promise.resolve(getResponse(getOrder())),
            );
        });

        it('loads order by using order id from order object', async () => {
            await from(orderActionCreator.loadCurrentOrder()(store)).toPromise();

            expect(orderRequestSender.loadOrder).toHaveBeenCalledWith(295, undefined);
        });

        it('loads order by using order id from checkout object if order object is unavailable', async () => {
            store = createCheckoutStore({
                ...state,
                checkout: undefined,
                order: getOrderState(),
            });

            await from(orderActionCreator.loadCurrentOrder()(store)).toPromise();

            expect(orderRequestSender.loadOrder).toHaveBeenCalledWith(295, undefined);
        });

        it('throws error if there is no existing order id', async () => {
            store = createCheckoutStore();

            try {
                await from(orderActionCreator.loadCurrentOrder()(store)).toPromise();
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
            jest.spyOn(orderRequestSender, 'loadOrder').mockReturnValue(
                Promise.resolve(getResponse(getOrder())),
            );
        });

        it('emits actions if able to load order', async () => {
            const actions = await orderActionCreator
                .loadOrderPayments(295)
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: OrderActionType.LoadOrderPaymentsRequested },
                { type: OrderActionType.LoadOrderPaymentsSucceeded, payload: getOrder() },
            ]);
        });

        it('emits actions if unable to load order', async () => {
            jest.spyOn(orderRequestSender, 'loadOrder').mockReturnValue(
                Promise.reject(getErrorResponse()),
            );

            const errorHandler = jest.fn((action) => of(action));
            const actions = await orderActionCreator
                .loadOrderPayments(295)
                .pipe(catchError(errorHandler), toArray())
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: OrderActionType.LoadOrderPaymentsRequested },
                {
                    type: OrderActionType.LoadOrderPaymentsFailed,
                    payload: getErrorResponse(),
                    error: true,
                },
            ]);
        });

        it('loads order by using order id from order object', async () => {
            await orderActionCreator.loadOrderPayments(295).toPromise();

            expect(orderRequestSender.loadOrder).toHaveBeenCalledWith(295, undefined);
        });

        it('loads order by using order id from checkout object if order object is unavailable', async () => {
            store = createCheckoutStore({
                ...state,
                checkout: undefined,
                order: getOrderState(),
            });

            await orderActionCreator.loadOrderPayments(295).toPromise();

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
            submitResponse = getResponse(
                getSubmitOrderResponseBody(),
                getSubmitOrderResponseHeaders(),
            );
            errorResponse = getErrorResponse();

            jest.spyOn(checkoutRequestSender, 'loadCheckout').mockReturnValue(
                Promise.resolve(getResponse(getCheckout())),
            );

            jest.spyOn(orderRequestSender, 'loadOrder').mockReturnValue(
                Promise.resolve(loadResponse),
            );

            jest.spyOn(orderRequestSender, 'submitOrder').mockReturnValue(
                // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                Promise.resolve(submitResponse),
            );
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

        it('requests order details and skips loadOrder when the experiment is enabled and the response includes orderDetails', async () => {
            jest.spyOn(store.getState().config, 'getStoreConfigOrThrow').mockReturnValue({
                ...getConfig().storeConfig,
                checkoutSettings: {
                    ...getConfig().storeConfig.checkoutSettings,
                    features: {
                        [RETURN_FULL_ORDER_DETAILS_ON_CREATE_ORDER]: true,
                    },
                },
            });

            const responseWithOrderDetails: Response<InternalOrderResponseBody> = getResponse(
                {
                    ...getSubmitOrderResponseBody(),
                    data: {
                        ...getSubmitOrderResponseBody().data,
                        orderDetails: getOrder(),
                    },
                },
                getSubmitOrderResponseHeaders(),
            );

            jest.spyOn(orderRequestSender, 'submitOrder').mockResolvedValue(
                responseWithOrderDetails,
            );

            const actions = await from(orderActionCreator.submitOrder(getOrderRequestBody())(store))
                .pipe(toArray())
                .toPromise();

            expect(orderRequestSender.submitOrder).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({ includeOrderDetails: true }),
            );
            expect(orderRequestSender.loadOrder).not.toHaveBeenCalled();
            expect(actions).toEqual([
                { type: OrderActionType.SubmitOrderRequested },
                { type: OrderActionType.LoadOrderSucceeded, payload: getOrder() },
                {
                    type: OrderActionType.SubmitOrderSucceeded,
                    payload: responseWithOrderDetails.body.data,
                    meta: {
                        ...responseWithOrderDetails.body.meta,
                        token: responseWithOrderDetails.headers.token,
                    },
                },
            ]);
        });

        it('emits error actions if unable to submit order', async () => {
            jest.spyOn(orderRequestSender, 'submitOrder').mockReturnValue(
                Promise.reject(errorResponse),
            );

            const errorHandler = jest.fn((action) => of(action));
            const actions = await from(orderActionCreator.submitOrder(getOrderRequestBody())(store))
                .pipe(catchError(errorHandler), toArray())
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: OrderActionType.SubmitOrderRequested },
                { type: OrderActionType.SubmitOrderFailed, payload: errorResponse, error: true },
            ]);
        });

        it('verifies cart content', async () => {
            await from(orderActionCreator.submitOrder(getOrderRequestBody())(store)).toPromise();

            expect(checkoutValidator.validate).toHaveBeenCalled();
        });

        it('throws error if spam check should be run', async () => {
            const checkout = getCheckout();

            checkout.shouldExecuteSpamCheck = true;

            const checkoutState = getCheckoutState();

            checkoutState.data = checkout;

            const checkoutStoreState = {
                ...getCheckoutStoreState(),
                checkout: checkoutState,
            };
            const state = {
                ...checkoutStoreState,
                order: {
                    errors: {},
                    meta: {},
                    statuses: {},
                },
            };
            const store = createCheckoutStore(state);

            try {
                await from(
                    orderActionCreator.submitOrder(getOrderRequestBody())(store),
                ).toPromise();
            } catch (error) {
                expect((error as { payload: any }).payload).toBeInstanceOf(
                    SpamProtectionNotCompletedError,
                );
            }
        });

        it('submits order payload with payment data', async () => {
            await from(orderActionCreator.submitOrder(getOrderRequestBody())(store)).toPromise();

            expect(orderRequestSender.submitOrder).toHaveBeenCalledWith(
                getInternalOrderRequestBody(),
                { headers: { checkoutVariant: 'default' }, includeOrderDetails: false },
            );
        });

        it('submits order payload without payment data', async () => {
            await from(
                orderActionCreator.submitOrder(omit(getOrderRequestBody(), 'payment'))(store),
            ).toPromise();

            expect(orderRequestSender.submitOrder).toHaveBeenCalledWith(
                omit(getInternalOrderRequestBody(), 'payment'),
                { headers: { checkoutVariant: 'default' }, includeOrderDetails: false },
            );
        });

        it('does not submit order if cart verification fails', async () => {
            jest.spyOn(checkoutValidator, 'validate').mockReturnValue(Promise.reject('foo'));

            store = createCheckoutStore({
                ...state,
                cart: merge({}, getCartState(), { data: { ...getCart(), currency: 'JPY' } }),
                config: getConfigState(),
            });

            try {
                await from(
                    orderActionCreator.submitOrder(getOrderRequestBody())(store),
                ).toPromise();
            } catch (action) {
                expect(orderRequestSender.submitOrder).not.toHaveBeenCalled();
                expect((action as Action).payload).toBe('foo');
            }
        });

        it('loads current order after order submission', async () => {
            await from(orderActionCreator.submitOrder(getOrderRequestBody())(store)).toPromise();

            expect(orderRequestSender.loadOrder).toHaveBeenCalledWith(295, undefined);
        });

        describe('when validate_cart_version_on_order_creation experiment is enabled', () => {
            beforeEach(() => {
                jest.spyOn(store.getState().config, 'getStoreConfigOrThrow').mockReturnValue({
                    ...getConfig().storeConfig,
                    checkoutSettings: {
                        ...getConfig().storeConfig.checkoutSettings,
                        features: {
                            [VALIDATE_CART_VERSION_ON_ORDER_CREATION]: true,
                        },
                    },
                });
            });

            it('submits order with cart version and does not call CheckoutValidator beforehand', async () => {
                await from(
                    orderActionCreator.submitOrder(getOrderRequestBody())(store),
                ).toPromise();

                expect(orderRequestSender.submitOrder).toHaveBeenCalledWith(
                    expect.objectContaining({ version: getCheckout().version }),
                    expect.anything(),
                );
                expect(checkoutValidator.validate).not.toHaveBeenCalled();
            });

            it('optimistically bumps the cart version by one when the order is created', async () => {
                const actions = await from(
                    orderActionCreator.submitOrder(getOrderRequestBody())(store),
                )
                    .pipe(toArray())
                    .toPromise();

                const succeededAction = actions.find(
                    (action) => action.type === OrderActionType.SubmitOrderSucceeded,
                );

                expect(succeededAction?.meta).toEqual(
                    expect.objectContaining({ version: getCheckout().version + 1 }),
                );
            });

            it('falls back to CheckoutValidator and throws CartChangedError when the comparator detects a diff', async () => {
                const cartConsistencyError = new CartConsistencyError();
                const cartChangedError = new CartChangedError(
                    { cart: {}, coupons: [], giftCertificates: [], outstandingBalance: 0 },
                    { cart: {}, coupons: [], giftCertificates: [], outstandingBalance: 0 },
                );

                jest.spyOn(orderRequestSender, 'submitOrder').mockReturnValue(
                    Promise.reject(cartConsistencyError),
                );
                jest.spyOn(checkoutValidator, 'validate').mockReturnValue(
                    Promise.reject(cartChangedError),
                );

                const errorHandler = jest.fn((action) => of(action));
                const actions = await from(
                    orderActionCreator.submitOrder(getOrderRequestBody())(store),
                )
                    .pipe(catchError(errorHandler), toArray())
                    .toPromise();

                expect(checkoutValidator.validate).toHaveBeenCalled();
                expect(errorHandler).toHaveBeenCalled();
                expect(actions).toEqual([
                    { type: OrderActionType.SubmitOrderRequested },
                    {
                        type: OrderActionType.SubmitOrderFailed,
                        payload: cartChangedError,
                        error: true,
                    },
                ]);
            });

            it('retries with the corrected cart version and succeeds when the validator finds no diff', async () => {
                const cartConsistencyError = new CartConsistencyError();
                const freshCheckout = {
                    ...getCheckout(),
                    cart: { ...getCheckout().cart, version: 42 },
                };

                jest.spyOn(orderRequestSender, 'submitOrder')
                    .mockReturnValueOnce(Promise.reject(cartConsistencyError))
                    .mockReturnValueOnce(
                        // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        Promise.resolve(submitResponse),
                    );
                jest.spyOn(checkoutValidator, 'validate').mockReturnValue(
                    Promise.resolve(freshCheckout),
                );

                const actions = await from(
                    orderActionCreator.submitOrder(getOrderRequestBody())(store),
                )
                    .pipe(toArray())
                    .toPromise();

                expect(orderRequestSender.submitOrder).toHaveBeenCalledTimes(2);
                expect(orderRequestSender.submitOrder).toHaveBeenLastCalledWith(
                    expect.objectContaining({ version: 42 }),
                    expect.anything(),
                );

                const succeededAction = actions.find(
                    (action) => action.type === OrderActionType.SubmitOrderSucceeded,
                );

                expect(succeededAction?.meta).toEqual(expect.objectContaining({ version: 43 }));
            });

            it('propagates the error when the retried submission also fails', async () => {
                const cartConsistencyError = new CartConsistencyError();

                jest.spyOn(orderRequestSender, 'submitOrder').mockReturnValue(
                    Promise.reject(cartConsistencyError),
                );
                jest.spyOn(checkoutValidator, 'validate').mockReturnValue(
                    Promise.resolve(getCheckout()),
                );

                const errorHandler = jest.fn((action) => of(action));
                const actions = await from(
                    orderActionCreator.submitOrder(getOrderRequestBody())(store),
                )
                    .pipe(catchError(errorHandler), toArray())
                    .toPromise();

                expect(checkoutValidator.validate).toHaveBeenCalled();
                expect(orderRequestSender.submitOrder).toHaveBeenCalledTimes(2);
                expect(actions).toEqual([
                    { type: OrderActionType.SubmitOrderRequested },
                    {
                        type: OrderActionType.SubmitOrderFailed,
                        payload: cartConsistencyError,
                        error: true,
                    },
                ]);
            });

            it('does not call CheckoutValidator when submission fails with an unrelated error', async () => {
                jest.spyOn(orderRequestSender, 'submitOrder').mockReturnValue(
                    Promise.reject(errorResponse),
                );

                const errorHandler = jest.fn((action) => of(action));

                await from(orderActionCreator.submitOrder(getOrderRequestBody())(store))
                    .pipe(catchError(errorHandler), toArray())
                    .toPromise();

                expect(checkoutValidator.validate).not.toHaveBeenCalled();
            });
        });
    });

    describe('#finalizeOrder()', () => {
        let errorResponse: Response<ErrorResponseBody>;
        let response: Response<InternalOrderResponseBody>;

        beforeEach(() => {
            response = getResponse(getCompleteOrderResponseBody());
            errorResponse = getErrorResponse();

            jest.spyOn(orderRequestSender, 'loadOrder').mockReturnValue(
                Promise.resolve(getResponse(getOrder())),
            );
        });

        it('emits actions if able to finalize order', async () => {
            jest.spyOn(orderRequestSender, 'finalizeOrder').mockReturnValue(
                Promise.resolve(response),
            );

            const actions = await orderActionCreator.finalizeOrder(295).pipe(toArray()).toPromise();

            expect(actions).toEqual([
                { type: OrderActionType.FinalizeOrderRequested },
                { type: OrderActionType.LoadOrderRequested },
                { type: OrderActionType.LoadOrderSucceeded, payload: getOrder() },
                { type: OrderActionType.FinalizeOrderSucceeded, payload: response.body.data },
            ]);
        });

        it('emits error actions if unable to finalize order', async () => {
            jest.spyOn(orderRequestSender, 'finalizeOrder').mockReturnValue(
                Promise.reject(errorResponse),
            );

            const errorHandler = jest.fn((action) => of(action));
            const actions = await orderActionCreator
                .finalizeOrder(0)
                .pipe(catchError(errorHandler), toArray())
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: OrderActionType.FinalizeOrderRequested },
                { type: OrderActionType.FinalizeOrderFailed, payload: errorResponse, error: true },
            ]);
        });
    });
});
