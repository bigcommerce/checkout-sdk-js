import { ScriptLoader } from '@bigcommerce/script-loader';
import { merge } from 'lodash';

import {
    MissingDataError,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentIntegrationService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getOrder,
    getOrderRequestBody,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { getPaypalExpress } from './mocks/paypal-express-mock';
import { PaymentStatusTypes, PaypalSDK } from './paypal-express-types';

import { PaypalExpressPaymentStrategy, PaypalExpressScriptLoader } from './index';

describe('PaypalExpressPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;
    let paypalExpressScriptLoader: PaypalExpressScriptLoader;
    let strategy: PaypalExpressPaymentStrategy;
    let paymentMethod: PaymentMethod;
    let paypalSdk: PaypalSDK;
    const orderRedirectUrl = 'https://paypal.com/checkout';

    beforeEach(() => {
        paymentMethod = getPaypalExpress();

        paymentIntegrationService = new PaymentIntegrationServiceMock();
        paypalExpressScriptLoader = new PaypalExpressScriptLoader(new ScriptLoader());

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
                PAYPAL: 'paypal',
            },
            Buttons: jest.fn(),
            Messages: jest.fn(),
        };

        strategy = new PaypalExpressPaymentStrategy(
            paymentIntegrationService,
            paypalExpressScriptLoader,
        );

        jest.spyOn(paypalExpressScriptLoader, 'loadPaypalSDK').mockImplementation(() => {
            return Promise.resolve(paypalSdk);
        });

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentStatus').mockReturnValue(
            undefined,
        );

        jest.spyOn(paymentIntegrationService, 'submitOrder').mockReturnValue(
            Promise.resolve({
                ...paymentIntegrationService.getState(),
                getPaymentRedirectUrl: () => orderRedirectUrl,
            }),
        );

        Object.defineProperty(window, 'top', {
            value: {
                location: {
                    href: '/checkout',
                },
            },
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('#initialize()', () => {
        describe('if in-context checkout is enabled', () => {
            it('loads Paypal SDK', async () => {
                await strategy.initialize({ methodId: paymentMethod.id });

                expect(paypalExpressScriptLoader.loadPaypalSDK).toHaveBeenCalled();
            });

            it('initializes Paypal SDK', async () => {
                await strategy.initialize({ methodId: paymentMethod.id });

                expect(paypalSdk.checkout.setup).toHaveBeenCalledWith(
                    paymentMethod.config.merchantId,
                    {
                        button: 'paypal-button',
                        environment: 'production',
                    },
                );
            });
        });

        describe('if in-context checkout is not enabled', () => {
            beforeEach(() => {
                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentMethodOrThrow',
                ).mockReturnValue({
                    ...paymentMethod,
                    config: { ...paymentMethod.config, merchantId: '' },
                });

                strategy = new PaypalExpressPaymentStrategy(
                    paymentIntegrationService,
                    paypalExpressScriptLoader,
                );
            });

            it('does not load Paypal SDK', async () => {
                try {
                    await strategy.initialize({ methodId: paymentMethod.id });
                } catch (error) {
                    expect(error).toBeInstanceOf(MissingDataError);
                    expect(paypalExpressScriptLoader.loadPaypalSDK).not.toHaveBeenCalled();
                }
            });

            it('does not initialize Paypal SDK', async () => {
                try {
                    await strategy.initialize({ methodId: paymentMethod.id });
                } catch (error) {
                    expect(error).toBeInstanceOf(MissingDataError);
                    expect(paypalSdk.checkout.setup).not.toHaveBeenCalled();
                }
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
                await new Promise((resolve) => process.nextTick(resolve));

                expect(paypalSdk.checkout.initXO).toHaveBeenCalled();
            });

            it('starts in-context payment flow', async () => {
                strategy.execute(payload);
                await new Promise((resolve) => process.nextTick(resolve));

                expect(paypalSdk.checkout.startFlow).toHaveBeenCalledWith(orderRedirectUrl);
            });

            it('does not open in-context modal if payment is already acknowledged', async () => {
                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentStatus',
                ).mockReturnValue(PaymentStatusTypes.ACKNOWLEDGE);

                strategy = new PaypalExpressPaymentStrategy(
                    paymentIntegrationService,
                    paypalExpressScriptLoader,
                );

                strategy.execute(payload);
                await new Promise((resolve) => process.nextTick(resolve));

                expect(paypalSdk.checkout.initXO).not.toHaveBeenCalled();
                expect(paypalSdk.checkout.startFlow).not.toHaveBeenCalled();
            });

            it('does not open in-context modal if payment is already finalized', async () => {
                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentStatus',
                ).mockReturnValue(PaymentStatusTypes.FINALIZE);

                strategy = new PaypalExpressPaymentStrategy(
                    paymentIntegrationService,
                    paypalExpressScriptLoader,
                );

                strategy.execute(payload);
                await new Promise((resolve) => process.nextTick(resolve));

                expect(paypalSdk.checkout.initXO).not.toHaveBeenCalled();
                expect(paypalSdk.checkout.startFlow).not.toHaveBeenCalled();
            });

            it('submits order with payment data', async () => {
                const options = { methodId: 'paypalexpress' };

                strategy.execute(payload, options);
                await new Promise((resolve) => process.nextTick(resolve));

                expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith(
                    payload,
                    options,
                );
            });

            it('does not redirect shopper directly if order submission is successful', async () => {
                strategy.execute(payload);
                await new Promise((resolve) => process.nextTick(resolve));

                expect(window.top?.location.href).toBe('/checkout');
            });
        });

        describe('if in-context checkout is not enabled', () => {
            beforeEach(async () => {
                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentMethodOrThrow',
                ).mockReturnValue({
                    ...paymentMethod,
                    config: { ...paymentMethod.config, merchantId: '' },
                });

                strategy = new PaypalExpressPaymentStrategy(
                    paymentIntegrationService,
                    paypalExpressScriptLoader,
                );

                try {
                    await strategy.initialize({ methodId: paymentMethod.id });
                } catch {
                    // Initialization error is expected and intentionally ignored in tests
                }
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
                const options = { methodId: 'paypalexpress' };

                strategy.execute(payload, options);
                await new Promise((resolve) => process.nextTick(resolve));

                expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith(
                    payload,
                    options,
                );
            });

            it('redirects shopper directly if order submission is successful', async () => {
                strategy.execute(payload);
                await new Promise((resolve) => process.nextTick(resolve));

                expect(window.top?.location.href).toEqual(orderRedirectUrl);
            });

            it('does not redirect shopper if payment is already acknowledged', async () => {
                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentStatus',
                ).mockReturnValue(PaymentStatusTypes.ACKNOWLEDGE);

                strategy = new PaypalExpressPaymentStrategy(
                    paymentIntegrationService,
                    paypalExpressScriptLoader,
                );

                strategy.execute(payload);
                await new Promise((resolve) => process.nextTick(resolve));

                expect(window.top?.location.href).toBe('/checkout');
            });

            it('does not redirect shopper if payment is already finalized', async () => {
                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentStatus',
                ).mockReturnValue(PaymentStatusTypes.FINALIZE);

                strategy = new PaypalExpressPaymentStrategy(
                    paymentIntegrationService,
                    paypalExpressScriptLoader,
                );

                strategy.execute(payload);
                await new Promise((resolve) => process.nextTick(resolve));

                expect(window.top?.location.href).toBe('/checkout');
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
                await new Promise((resolve) => process.nextTick(resolve));

                expect(paypalSdk.checkout.startFlow).not.toHaveBeenCalled();
            });

            it('redirects shopper directly if order submission is successful', async () => {
                strategy.execute(payload);
                await new Promise((resolve) => process.nextTick(resolve));

                expect(window.top?.location.href).toEqual(orderRedirectUrl);
            });
        });
    });

    describe('#finalize()', () => {
        beforeEach(async () => {
            strategy = new PaypalExpressPaymentStrategy(
                paymentIntegrationService,
                paypalExpressScriptLoader,
            );

            jest.spyOn(paymentIntegrationService.getState(), 'getOrder').mockReturnValue(
                getOrder(),
            );

            await strategy.initialize({ methodId: paymentMethod.id });
        });

        it('finalizes order if order is created and payment is acknowledged', async () => {
            jest.spyOn(paymentIntegrationService.getState(), 'getPaymentStatus').mockReturnValue(
                PaymentStatusTypes.ACKNOWLEDGE,
            );

            await strategy.finalize();

            expect(paymentIntegrationService.finalizeOrder).toHaveBeenCalled();
        });

        it('finalizes order if order is created and payment is finalized', async () => {
            jest.spyOn(paymentIntegrationService.getState(), 'getPaymentStatus').mockReturnValue(
                PaymentStatusTypes.FINALIZE,
            );

            await strategy.finalize();

            expect(paymentIntegrationService.finalizeOrder).toHaveBeenCalled();
        });

        it('does not finalize order if order is not created', async () => {
            jest.spyOn(paymentIntegrationService.getState(), 'getOrder').mockReturnValue(undefined);

            try {
                await strategy.finalize();
            } catch (error) {
                expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
                expect(paymentIntegrationService.finalizeOrder).not.toHaveBeenCalled();
            }
        });

        it('does not finalize order if order is not finalized or acknowledged', async () => {
            jest.spyOn(paymentIntegrationService.getState(), 'getPaymentStatus').mockReturnValue(
                undefined,
            );

            try {
                await strategy.finalize();
            } catch (error) {
                expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
                expect(paymentIntegrationService.finalizeOrder).not.toHaveBeenCalled();
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
        });

        describe('if in-context checkout is not enabled', () => {
            beforeEach(() => {
                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentMethodOrThrow',
                ).mockReturnValue({
                    ...paymentMethod,
                    config: { ...paymentMethod.config, merchantId: '' },
                });

                strategy = new PaypalExpressPaymentStrategy(
                    paymentIntegrationService,
                    paypalExpressScriptLoader,
                );
            });

            it('does not end paypal flow', async () => {
                try {
                    await strategy.initialize({ methodId: paymentMethod.id });
                } catch {
                    // Initialization error is expected and intentionally ignored in tests
                }

                await strategy.deinitialize();

                expect(paypalSdk.checkout.closeFlow).not.toHaveBeenCalled();
            });
        });
    });
});
