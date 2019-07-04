import { createAction } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { merge } from 'lodash';
import { of, Observable } from 'rxjs';

import { createCheckoutStore, CheckoutRequestSender, CheckoutStore, CheckoutStoreState, CheckoutValidator } from '../../../checkout';
import { getCheckoutPayment, getCheckoutStoreState, getCheckoutStoreStateWithOrder } from '../../../checkout/checkouts.mock';
import { getCustomer } from '../../../customer/internal-customers.mock';
import { FinalizeOrderAction, InternalOrder, OrderActionCreator, OrderActionType, OrderRequestBody, OrderRequestSender, SubmitOrderAction } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { getOrderRequestBody, getSubmittedOrder } from '../../../order/internal-orders.mock';
import { createSpamProtection, SpamProtectionActionCreator } from '../../../order/spam-protection';
import PaymentMethod from '../../payment-method';
import { getPaypalExpress } from '../../payment-methods.mock';
import * as paymentStatusTypes from '../../payment-status-types';

import PaypalExpressPaymentStrategy from './paypal-express-payment-strategy';
import PaypalScriptLoader from './paypal-script-loader';
import { PaypalHostWindow, PaypalSDK } from './paypal-sdk';

describe('PaypalExpressPaymentStrategy', () => {
    let finalizeOrderAction: Observable<FinalizeOrderAction>;
    let order: InternalOrder;
    let orderActionCreator: OrderActionCreator;
    let paymentMethod: PaymentMethod;
    let paypalSdk: PaypalSDK;
    let scriptLoader: PaypalScriptLoader;
    let state: CheckoutStoreState;
    let store: CheckoutStore;
    let strategy: PaypalExpressPaymentStrategy;
    let submitOrderAction: Observable<SubmitOrderAction>;
    let mockWindow: PaypalHostWindow;

    beforeEach(() => {
        orderActionCreator = new OrderActionCreator(
            new OrderRequestSender(createRequestSender()),
            new CheckoutValidator(new CheckoutRequestSender(createRequestSender())),
            new SpamProtectionActionCreator(createSpamProtection(createScriptLoader()))
        );

        paypalSdk = {
            checkout: {
                setup: jest.fn(),
                initXO: jest.fn(),
                startFlow: jest.fn(),
                closeFlow: jest.fn(),
            },
            Button: {
                render: jest.fn(),
            },
            FUNDING: {
                CARD: 'card',
                CREDIT: 'credit',
            },
        };

        scriptLoader = new PaypalScriptLoader(createScriptLoader());
        state = getCheckoutStoreState();
        store = createCheckoutStore(state);

        order = merge({}, getSubmittedOrder(), {
            payment: {
                id: 'paypalexpress',
                redirectUrl: 'https://paypal.com/checkout',
            },
        });

        mockWindow = {
            top: {
                location: {
                    href: '/checkout',
                },
            },
        } as Window;

        paymentMethod = getPaypalExpress();
        finalizeOrderAction = of(createAction(OrderActionType.FinalizeOrderRequested));
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderSucceeded, { customer: getCustomer(), order }));

        jest.spyOn(scriptLoader, 'loadPaypal')
            .mockImplementation(() => {
                mockWindow.paypal = paypalSdk;

                return Promise.resolve(paypalSdk);
            });

        jest.spyOn(store, 'dispatch');

        jest.spyOn(orderActionCreator, 'finalizeOrder')
            .mockReturnValue(finalizeOrderAction);

        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(submitOrderAction);

        strategy = new PaypalExpressPaymentStrategy(store, orderActionCreator, scriptLoader, mockWindow);
    });

    describe('#initialize()', () => {
        describe('if in-context checkout is enabled', () => {
            it('loads Paypal SDK', async () => {
                await strategy.initialize({ methodId: paymentMethod.id });

                expect(scriptLoader.loadPaypal).toHaveBeenCalled();
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
                        ...state.paymentMethods,
                        data: [
                            { ...paymentMethod, config: { ...paymentMethod.config, merchantId: '' } },
                        ],
                    },
                });

                strategy = new PaypalExpressPaymentStrategy(store, orderActionCreator, scriptLoader, mockWindow);
            });

            it('does not load Paypal SDK', async () => {
                await strategy.initialize({ methodId: paymentMethod.id });

                expect(scriptLoader.loadPaypal).not.toHaveBeenCalled();
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
        let payload: OrderRequestBody;

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
                await new Promise(resolve => process.nextTick(resolve));

                expect(paypalSdk.checkout.initXO).toHaveBeenCalled();
            });

            it('starts in-context payment flow', async () => {
                strategy.execute(payload);
                await new Promise(resolve => process.nextTick(resolve));

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

                strategy = new PaypalExpressPaymentStrategy(store, orderActionCreator, scriptLoader, mockWindow);

                strategy.execute(payload);
                await new Promise(resolve => process.nextTick(resolve));

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

                strategy = new PaypalExpressPaymentStrategy(store, orderActionCreator, scriptLoader, mockWindow);

                strategy.execute(payload);
                await new Promise(resolve => process.nextTick(resolve));

                expect(paypalSdk.checkout.initXO).not.toHaveBeenCalled();
                expect(paypalSdk.checkout.startFlow).not.toHaveBeenCalled();
            });

            it('submits order with payment data', async () => {
                const options = { methodId: 'paypalexpress' };

                strategy.execute(payload, options);
                await new Promise(resolve => process.nextTick(resolve));

                expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(payload, options);
                expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
            });

            it('does not redirect shopper directly if order submission is successful', async () => {
                strategy.execute(payload);
                await new Promise(resolve => process.nextTick(resolve));

                expect(mockWindow.top.location.href).toEqual('/checkout');
            });
        });

        describe('if in-context checkout is not enabled', () => {
            beforeEach(async () => {
                store = createCheckoutStore({
                    ...state,
                    paymentMethods: {
                        ...state.paymentMethods,
                        data: [
                            { ...paymentMethod, config: { merchantId: '' } },
                        ],
                    },
                });

                jest.spyOn(store, 'dispatch');

                strategy = new PaypalExpressPaymentStrategy(store, orderActionCreator, scriptLoader, mockWindow);

                await strategy.initialize({ methodId: paymentMethod.id });
            });

            it('does not open in-context modal', async () => {
                strategy.execute(payload);
                await new Promise(resolve => process.nextTick(resolve));

                expect(paypalSdk.checkout.initXO).not.toHaveBeenCalled();
            });

            it('does not start in-context payment flow', async () => {
                strategy.execute(payload);
                await new Promise(resolve => process.nextTick(resolve));

                expect(paypalSdk.checkout.startFlow).not.toHaveBeenCalled();
            });

            it('submits order with payment data', async () => {
                const options = { methodId: 'paypalexpress' };

                strategy.execute(payload, options);
                await new Promise(resolve => process.nextTick(resolve));

                expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(payload, options);
                expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
            });

            it('redirects shopper directly if order submission is successful', async () => {
                strategy.execute(payload);
                await new Promise(resolve => process.nextTick(resolve));

                expect(mockWindow.top.location.href).toEqual(order.payment.redirectUrl);
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

                strategy = new PaypalExpressPaymentStrategy(store, orderActionCreator, scriptLoader, mockWindow);

                strategy.execute(payload);
                await new Promise(resolve => process.nextTick(resolve));

                expect(mockWindow.top.location.href).toEqual('/checkout');
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

                strategy = new PaypalExpressPaymentStrategy(store, orderActionCreator, scriptLoader, mockWindow);

                strategy.execute(payload);
                await new Promise(resolve => process.nextTick(resolve));

                expect(mockWindow.top.location.href).toEqual('/checkout');
            });
        });

        describe('if redirect flow is chosen', () => {
            beforeEach(async () => {
                await strategy.initialize({
                    methodId: paymentMethod.id,
                    paypalexpress: {
                        useRedirectFlow: true,
                    },
                });
            });

            it('does not start in-context payment flow', async () => {
                strategy.execute(payload);
                await new Promise(resolve => process.nextTick(resolve));

                expect(paypalSdk.checkout.startFlow).not.toHaveBeenCalled();
            });

            it('redirects shopper directly if order submission is successful', async () => {
                strategy.execute(payload);
                await new Promise(resolve => process.nextTick(resolve));

                expect(mockWindow.top.location.href).toEqual(order.payment.redirectUrl);
            });
        });
    });

    describe('#finalize()', () => {
        beforeEach(async () => {
            store = createCheckoutStore(getCheckoutStoreStateWithOrder());
            strategy = new PaypalExpressPaymentStrategy(store, orderActionCreator, scriptLoader, mockWindow);

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
                        ...state.paymentMethods,
                        data: [
                            { ...paymentMethod, config: { merchantId: '' } },
                        ],
                    },
                });

                strategy = new PaypalExpressPaymentStrategy(store, orderActionCreator, scriptLoader, mockWindow);
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
