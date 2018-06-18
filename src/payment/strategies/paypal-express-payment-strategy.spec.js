import { createAction } from '@bigcommerce/data-store';
import { Observable } from 'rxjs';
import { merge } from 'lodash';
import { createCheckoutClient, createCheckoutStore } from '../../checkout';
import { OrderFinalizationNotRequiredError } from '../../order/errors';
import { getOrderRequestBody, getSubmittedOrder } from '../../order/internal-orders.mock';
import { OrderActionCreator, OrderActionType } from '../../order';
import { getPaypalExpress } from '../payment-methods.mock';
import * as paymentStatusTypes from '../payment-status-types';
import PaypalExpressPaymentStrategy from './paypal-express-payment-strategy';
import { getCheckoutPayment, getCheckoutStoreState, getCheckoutStoreStateWithOrder } from '../../checkout/checkouts.mock';

describe('PaypalExpressPaymentStrategy', () => {
    let finalizeOrderAction;
    let order;
    let orderActionCreator;
    let paymentMethod;
    let paypalSdk;
    let scriptLoader;
    let state;
    let store;
    let strategy;
    let submitOrderAction;

    beforeEach(() => {
        orderActionCreator = new OrderActionCreator(createCheckoutClient());

        paypalSdk = {
            checkout: {
                setup: jest.fn(),
                initXO: jest.fn(),
                startFlow: jest.fn(),
                closeFlow: jest.fn(),
            },
        };

        scriptLoader = {
            loadScript: jest.fn(() => {
                window.paypal = paypalSdk;

                return Promise.resolve();
            }),
        };

        state = getCheckoutStoreState();
        store = createCheckoutStore(state);

        order = merge({}, getSubmittedOrder(), {
            payment: {
                id: 'paypalexpress',
                redirectUrl: 'https://s1504075966.bcapp.dev/checkout',
            },
        });

        paymentMethod = getPaypalExpress();
        finalizeOrderAction = Observable.of(createAction(OrderActionType.FinalizeOrderRequested));
        submitOrderAction = Observable.of(createAction(OrderActionType.SubmitOrderSucceeded, { order }));

        jest.spyOn(window.location, 'assign').mockImplementation(() => {});

        jest.spyOn(store, 'dispatch');

        jest.spyOn(orderActionCreator, 'finalizeOrder')
            .mockReturnValue(finalizeOrderAction);

        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(submitOrderAction);

        strategy = new PaypalExpressPaymentStrategy(store, orderActionCreator, scriptLoader);
    });

    afterEach(() => {
        window.location.assign.mockReset();
    });

    describe('#initialize()', () => {
        describe('if in-context checkout is enabled', () => {
            it('loads Paypal SDK', async () => {
                await strategy.initialize({ methodId: paymentMethod.id });

                expect(scriptLoader.loadScript).toHaveBeenCalledWith('//www.paypalobjects.com/api/checkout.min.js');
            });

            it('initializes Paypal SDK', async () => {
                await strategy.initialize({ methodId: paymentMethod.id });

                expect(paypalSdk.checkout.setup).toHaveBeenCalledWith(paymentMethod.config.merchantId, {
                    button: 'paypal-button',
                    environment: 'production',
                });
            });

            it('returns checkout state', async () => {
                const output = await strategy.initialize({ methodId: paymentMethod.id });

                expect(output).toEqual(store.getState());
            });
        });

        describe('if in-context checkout is not enabled', () => {
            beforeEach(() => {
                store = createCheckoutStore({
                    ...state,
                    paymentMethods: {
                        data: [
                            { ...paymentMethod, config: { merchantId: null } },
                        ],
                    },
                });

                strategy = new PaypalExpressPaymentStrategy(store, orderActionCreator, scriptLoader);
            });

            it('does not load Paypal SDK', async () => {
                await strategy.initialize({ methodId: paymentMethod.id });

                expect(scriptLoader.loadScript).not.toHaveBeenCalled();
            });

            it('does not initialize Paypal SDK', async () => {
                await strategy.initialize({ methodId: paymentMethod.id });

                expect(paypalSdk.checkout.setup).not.toHaveBeenCalled();
            });

            it('returns checkout state', async () => {
                const output = await strategy.initialize({ methodId: paymentMethod.id });

                expect(output).toEqual(store.getState());
            });
        });
    });

    describe('#execute()', () => {
        let payload;

        beforeEach(() => {
            payload = merge({}, getOrderRequestBody(), {
                payment: { methodId: paymentMethod.id },
            });
        });

        describe('if in-context checkout is enabled', () => {
            beforeEach(async () => {
                await strategy.initialize({ methodId: paymentMethod.id });
            });

            it('opens in-context modal', async () => {
                strategy.execute(payload);
                await new Promise((resolve) => process.nextTick(resolve));

                expect(paypalSdk.checkout.initXO).toHaveBeenCalled();
            });

            it('starts in-context payment flow', async () => {
                strategy.execute(payload);
                await new Promise((resolve) => process.nextTick(resolve));

                expect(paypalSdk.checkout.startFlow).toHaveBeenCalledWith(order.payment.redirectUrl);
            });

            it('does not open in-context modal if payment is already acknowledged', async () => {
                store = createCheckoutStore({
                    ...state,
                    checkout: merge(state.checkout, {
                        data: {
                            payments: [{
                                ...getCheckoutPayment(),
                                detail: {
                                    step: paymentStatusTypes.ACKNOWLEDGE,
                                },
                            }],
                        },
                    }),
                });

                strategy = new PaypalExpressPaymentStrategy(store, orderActionCreator, scriptLoader);

                strategy.execute(payload);
                await new Promise((resolve) => process.nextTick(resolve));

                expect(paypalSdk.checkout.initXO).not.toHaveBeenCalled();
                expect(paypalSdk.checkout.startFlow).not.toHaveBeenCalled();
            });

            it('does not open in-context modal if payment is already finalized', async () => {
                store = createCheckoutStore({
                    ...state,
                    checkout: merge(state.checkout, {
                        data: {
                            payments: [{
                                ...getCheckoutPayment(),
                                detail: {
                                    step: paymentStatusTypes.FINALIZE,
                                },
                            }],
                        },
                    }),
                });

                strategy = new PaypalExpressPaymentStrategy(store, orderActionCreator, scriptLoader);

                strategy.execute(payload);
                await new Promise((resolve) => process.nextTick(resolve));

                expect(paypalSdk.checkout.initXO).not.toHaveBeenCalled();
                expect(paypalSdk.checkout.startFlow).not.toHaveBeenCalled();
            });

            it('submits order with payment data', async () => {
                const options = {};

                strategy.execute(payload, options);
                await new Promise((resolve) => process.nextTick(resolve));

                expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(payload, options);
                expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
            });

            it('does not redirect shopper directly if order submission is successful', async () => {
                strategy.execute(payload);
                await new Promise((resolve) => process.nextTick(resolve));

                expect(window.location.assign).not.toHaveBeenCalled();
            });
        });

        describe('if in-context checkout is not enabled', () => {
            beforeEach(async () => {
                store = createCheckoutStore({
                    ...state,
                    paymentMethods: {
                        data: [
                            { ...paymentMethod, config: { merchantId: null } },
                        ],
                    },
                });

                jest.spyOn(store, 'dispatch');

                strategy = new PaypalExpressPaymentStrategy(store, orderActionCreator, scriptLoader);

                await strategy.initialize({ methodId: paymentMethod.id });
            });

            it('does not open in-context modal', async () => {
                strategy.execute(payload);
                await new Promise((resolve) => process.nextTick(resolve));

                expect(paypalSdk.checkout.initXO).not.toHaveBeenCalled();
            });

            it('does not start in-context payment flow', async () => {
                strategy.execute(payload);
                await new Promise((resolve) => process.nextTick(resolve));

                expect(paypalSdk.checkout.startFlow).not.toHaveBeenCalled();
            });

            it('submits order with payment data', async () => {
                const options = {};

                strategy.execute(payload, options);
                await new Promise((resolve) => process.nextTick(resolve));

                expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(payload, options);
                expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
            });

            it('redirects shopper directly if order submission is successful', async () => {
                strategy.execute(payload);
                await new Promise((resolve) => process.nextTick(resolve));

                expect(window.location.assign).toHaveBeenCalledWith(order.payment.redirectUrl);
            });

            it('does not redirect shopper if payment is already acknowledged', async () => {
                store = createCheckoutStore({
                    ...state,
                    checkout: merge(state.checkout, {
                        data: {
                            payments: [{
                                ...getCheckoutPayment(),
                                detail: {
                                    step: paymentStatusTypes.ACKNOWLEDGE,
                                },
                            }],
                        },
                    }),
                });

                strategy = new PaypalExpressPaymentStrategy(store, orderActionCreator, scriptLoader);

                strategy.execute(payload);
                await new Promise((resolve) => process.nextTick(resolve));

                expect(window.location.assign).not.toHaveBeenCalled();
            });

            it('does not redirect shopper if payment is already finalized', async () => {
                store = createCheckoutStore({
                    ...state,
                    checkout: merge(state.checkout, {
                        data: {
                            payments: [{
                                ...getCheckoutPayment(),
                                detail: {
                                    step: paymentStatusTypes.FINALIZE,
                                },
                            }],
                        },
                    }),
                });

                strategy = new PaypalExpressPaymentStrategy(store, orderActionCreator, scriptLoader);

                strategy.execute(payload);
                await new Promise((resolve) => process.nextTick(resolve));

                expect(window.location.assign).not.toHaveBeenCalled();
            });
        });
    });

    describe('#finalize()', () => {
        beforeEach(async () => {
            store = createCheckoutStore(getCheckoutStoreStateWithOrder());
            strategy = new PaypalExpressPaymentStrategy(store, orderActionCreator, scriptLoader);

            jest.spyOn(store.getState().payment, 'getPaymentRedirectUrl')
                .mockReturnValue('https://s1504075966.bcapp.dev/checkout');

            jest.spyOn(store, 'dispatch');

            await strategy.initialize({ methodId: paymentMethod.id });
        });

        it('finalizes order if order is created and payment is acknowledged', async () => {
            jest.spyOn(store.getState().payment, 'getPaymentStatus')
                .mockReturnValue(paymentStatusTypes.ACKNOWLEDGE);

            await strategy.finalize();

            expect(orderActionCreator.finalizeOrder).toHaveBeenCalled();
            expect(store.dispatch).toHaveBeenCalledWith(finalizeOrderAction);
        });

        it('finalizes order if order is created and payment is finalized', async () => {
            jest.spyOn(store.getState().payment, 'getPaymentStatus')
                .mockReturnValue(paymentStatusTypes.FINALIZE);

            await strategy.finalize();

            expect(orderActionCreator.finalizeOrder).toHaveBeenCalled();
            expect(store.dispatch).toHaveBeenCalledWith(finalizeOrderAction);
        });

        it('does not finalize order if order is not created', async () => {
            jest.spyOn(store.getState().order, 'getOrder')
                .mockReturnValue(undefined);

            try {
                await strategy.finalize();
            } catch (error) {
                expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
                expect(orderActionCreator.finalizeOrder).not.toHaveBeenCalled();
                expect(store.dispatch).not.toHaveBeenCalledWith(finalizeOrderAction);
            }
        });

        it('does not finalize order if order is not finalized or acknowledged', async () => {
            jest.spyOn(store.getState().payment, 'getPaymentStatus')
                .mockReturnValue(undefined);

            try {
                await strategy.finalize();
            } catch (error) {
                expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
                expect(orderActionCreator.finalizeOrder).not.toHaveBeenCalled();
                expect(store.dispatch).not.toHaveBeenCalledWith(finalizeOrderAction);
            }
        });
    });

    describe('#deinitialize()', () => {
        describe('if in-context checkout is enabled', () => {
            it('ends paypal flow', async () => {
                await strategy.initialize({ methodId: paymentMethod.id });
                await strategy.deinitialize();

                expect(paypalSdk.checkout.closeFlow).toHaveBeenCalled();
            });

            it('does not end paypal flow if it is not initialized', async () => {
                await strategy.deinitialize();

                expect(paypalSdk.checkout.closeFlow).not.toHaveBeenCalled();
            });

            it('returns checkout state', async () => {
                expect(await strategy.deinitialize()).toEqual(store.getState());
            });
        });

        describe('if in-context checkout is not enabled', () => {
            beforeEach(() => {
                store = createCheckoutStore({
                    ...state,
                    paymentMethods: {
                        data: [
                            { ...paymentMethod, config: { merchantId: null } },
                        ],
                    },
                });

                strategy = new PaypalExpressPaymentStrategy(store, orderActionCreator, scriptLoader);
            });

            it('does not end paypal flow', async () => {
                await strategy.initialize({ methodId: paymentMethod.id });
                await strategy.deinitialize();

                expect(paypalSdk.checkout.closeFlow).not.toHaveBeenCalled();
            });

            it('returns checkout state', async () => {
                expect(await strategy.deinitialize()).toEqual(store.getState());
            });
        });
    });
});
