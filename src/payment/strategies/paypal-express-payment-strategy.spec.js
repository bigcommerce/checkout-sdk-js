import { merge } from 'lodash';
import { createCheckoutStore } from '../../checkout';
import { OrderFinalizationNotRequiredError } from '../../order/errors';
import { getOrderRequestBody, getIncompleteOrder, getSubmittedOrder } from '../../order/internal-orders.mock';
import { getPaypalExpress } from '../payment-methods.mock';
import * as paymentStatusTypes from '../payment-status-types';
import PaypalExpressPaymentStrategy from './paypal-express-payment-strategy';

describe('PaypalExpressPaymentStrategy', () => {
    let paymentMethod;
    let paypalSdk;
    let placeOrderService;
    let scriptLoader;
    let store;
    let strategy;

    beforeEach(() => {
        placeOrderService = {
            finalizeOrder: jest.fn(() => Promise.resolve(store.getState())),
            verifyCart: jest.fn(() => Promise.resolve(store.getState())),
            submitOrder: jest.fn(() => Promise.resolve(store.getState())),
            submitPayment: jest.fn(() => Promise.resolve(store.getState())),
        };

        paypalSdk = {
            checkout: {
                setup: jest.fn(),
                initXO: jest.fn(),
                startFlow: jest.fn(() => {
                    setTimeout(() => {
                        const event = document.createEvent('Event');

                        event.initEvent('unload', true, false);
                        document.body.dispatchEvent(event);
                    });
                }),
                closeFlow: jest.fn(),
            },
        };

        scriptLoader = {
            loadScript: jest.fn(() => {
                window.paypal = paypalSdk;

                return Promise.resolve();
            }),
        };

        store = createCheckoutStore();

        paymentMethod = getPaypalExpress();

        jest.spyOn(window.location, 'assign').mockImplementation(() => {
            setTimeout(() => {
                const event = document.createEvent('Event');

                event.initEvent('unload', true, false);
                document.body.dispatchEvent(event);
            });
        });

        strategy = new PaypalExpressPaymentStrategy(store, placeOrderService, scriptLoader);
    });

    afterEach(() => {
        window.location.assign.mockReset();
    });

    describe('#initialize()', () => {
        describe('if in-context checkout is enabled', () => {
            it('loads Paypal SDK', async () => {
                await strategy.initialize({ paymentMethod });

                expect(scriptLoader.loadScript).toHaveBeenCalledWith('//www.paypalobjects.com/api/checkout.min.js');
            });

            it('initializes Paypal SDK', async () => {
                await strategy.initialize({ paymentMethod });

                expect(paypalSdk.checkout.setup).toHaveBeenCalledWith(paymentMethod.config.merchantId, {
                    button: 'paypal-button',
                    environment: 'production',
                });
            });

            it('returns checkout state', async () => {
                const output = await strategy.initialize({ paymentMethod });

                expect(output).toEqual(store.getState());
            });
        });

        describe('if in-context checkout is not enabled', () => {
            beforeEach(() => {
                paymentMethod.config.merchantId = null;
            });

            it('does not load Paypal SDK', async () => {
                await strategy.initialize({ paymentMethod });

                expect(scriptLoader.loadScript).not.toHaveBeenCalled();
            });

            it('does not initialize Paypal SDK', async () => {
                await strategy.initialize({ paymentMethod });

                expect(paypalSdk.checkout.setup).not.toHaveBeenCalled();
            });

            it('returns checkout state', async () => {
                const output = await strategy.initialize({ paymentMethod });

                expect(output).toEqual(store.getState());
            });
        });
    });

    describe('#execute()', () => {
        let order;
        let payload;

        beforeEach(() => {
            payload = merge({}, getOrderRequestBody(), {
                payment: { name: paymentMethod.id },
            });

            order = merge({}, getSubmittedOrder(), {
                payment: {
                    id: 'paypalexpress',
                    redirectUrl: 'https://s1504075966.bcapp.dev/checkout',
                },
            });

            jest.spyOn(store.getState().checkout, 'getOrder').mockReturnValue(order);
        });

        describe('if in-context checkout is enabled', () => {
            beforeEach(async () => {
                await strategy.initialize({ paymentMethod });
            });

            it('opens in-context modal', async () => {
                await strategy.execute(payload);

                expect(paypalSdk.checkout.initXO).toHaveBeenCalled();
            });

            it('starts in-context payment flow', async () => {
                await strategy.execute(payload);

                expect(paypalSdk.checkout.startFlow).toHaveBeenCalledWith(order.payment.redirectUrl);
            });

            it('does not open in-context modal if payment is already acknowledged', async () => {
                order.payment.status = paymentStatusTypes.ACKNOWLEDGE;

                await strategy.execute(payload);

                expect(paypalSdk.checkout.initXO).not.toHaveBeenCalled();
                expect(paypalSdk.checkout.startFlow).not.toHaveBeenCalled();
            });

            it('does not open in-context modal if payment is already finalized', async () => {
                order.payment.status = paymentStatusTypes.FINALIZE;

                await strategy.execute(payload);

                expect(paypalSdk.checkout.initXO).not.toHaveBeenCalled();
                expect(paypalSdk.checkout.startFlow).not.toHaveBeenCalled();
            });

            it('submits order with payment data', async () => {
                const options = {};

                await strategy.execute(payload, options);

                expect(placeOrderService.submitOrder).toHaveBeenCalledWith(payload, true, options);
            });

            it('does not submit payment data separately', async () => {
                const options = {};

                await strategy.execute(payload, options);

                expect(placeOrderService.submitPayment).not.toHaveBeenCalledWith(options);
            });

            it('does not redirect shopper directly if order submission is successful', async () => {
                await strategy.execute(payload);

                expect(window.location.assign).not.toHaveBeenCalled();
            });

            it('returns checkout state', async () => {
                const output = await strategy.execute(payload);

                expect(output).toEqual(store.getState());
            });
        });

        describe('if in-context checkout is not enabled', () => {
            beforeEach(async () => {
                paymentMethod.config.merchantId = null;

                await strategy.initialize({ paymentMethod });
            });

            it('does not open in-context modal', async () => {
                await strategy.execute(payload);

                expect(paypalSdk.checkout.initXO).not.toHaveBeenCalled();
            });

            it('does not start in-context payment flow', async () => {
                await strategy.execute(payload);

                expect(paypalSdk.checkout.startFlow).not.toHaveBeenCalled();
            });

            it('submits order with payment data', async () => {
                const options = {};

                await strategy.execute(payload, options);

                expect(placeOrderService.submitOrder).toHaveBeenCalledWith(payload, true, options);
            });

            it('does not submit payment data separately', async () => {
                await strategy.execute(payload);

                expect(placeOrderService.submitPayment).not.toHaveBeenCalled();
            });

            it('redirects shopper directly if order submission is successful', async () => {
                await strategy.execute(payload);

                expect(window.location.assign).toHaveBeenCalledWith(order.payment.redirectUrl);
            });

            it('does not redirect shopper if payment is already acknowledged', async () => {
                order.payment.status = paymentStatusTypes.ACKNOWLEDGE;

                await strategy.execute(payload);

                expect(window.location.assign).not.toHaveBeenCalled();
            });

            it('does not redirect shopper if payment is already finalized', async () => {
                order.payment.status = paymentStatusTypes.FINALIZE;

                await strategy.execute(payload);

                expect(window.location.assign).not.toHaveBeenCalled();
            });

            it('returns checkout state', async () => {
                const output = await strategy.execute(payload);

                expect(output).toEqual(store.getState());
            });
        });
    });

    describe('#finalize()', () => {
        let order;

        beforeEach(async () => {
            order = merge({}, getSubmittedOrder(), {
                payment: {
                    id: 'paypalexpress',
                    redirectUrl: 'https://s1504075966.bcapp.dev/checkout',
                },
            });

            jest.spyOn(store.getState().checkout, 'getOrder').mockReturnValue(order);

            await strategy.initialize({ paymentMethod });
        });

        it('finalizes order if order is created and payment is acknowledged', async () => {
            order.payment.status = paymentStatusTypes.ACKNOWLEDGE;

            await strategy.finalize();

            expect(placeOrderService.finalizeOrder).toHaveBeenCalled();
        });

        it('finalizes order if order is created and payment is finalized', async () => {
            order.payment.status = paymentStatusTypes.FINALIZE;

            await strategy.finalize();

            expect(placeOrderService.finalizeOrder).toHaveBeenCalled();
        });

        it('does not finalize order if order is not created', async () => {
            jest.spyOn(store.getState().checkout, 'getOrder').mockReturnValue(getIncompleteOrder());

            try {
                await strategy.finalize();
            } catch (error) {
                expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
                expect(placeOrderService.finalizeOrder).not.toHaveBeenCalled();
            }
        });

        it('does not finalize order if order is not finalized or acknowledged', async () => {
            try {
                await strategy.finalize();
            } catch (error) {
                expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
                expect(placeOrderService.finalizeOrder).not.toHaveBeenCalled();
            }
        });
    });

    describe('#deinitialize()', () => {
        describe('if in-context checkout is enabled', () => {
            it('ends paypal flow', async () => {
                await strategy.initialize({ paymentMethod });
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
                paymentMethod.config.merchantId = null;
            });

            it('does not end paypal flow', async () => {
                await strategy.initialize({ paymentMethod });
                await strategy.deinitialize();

                expect(paypalSdk.checkout.closeFlow).not.toHaveBeenCalled();
            });

            it('returns checkout state', async () => {
                expect(await strategy.deinitialize()).toEqual(store.getState());
            });
        });
    });
});
