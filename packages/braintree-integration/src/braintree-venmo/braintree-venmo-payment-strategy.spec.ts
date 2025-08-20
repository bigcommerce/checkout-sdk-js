import {
    MissingDataError,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethod,
    PaymentMethodCancelledError,
    PaymentMethodFailedError,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BraintreeVenmoPaymentStrategy from './braintree-venmo-payment-strategy';
import {
    BraintreeIntegrationService,
    BraintreeScriptLoader,
    BraintreeSDKVersionManager,
    BraintreeTokenizePayload,
    BraintreeVenmoCheckout,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    getConfig,
    getOrderRequestBody,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';
import { getScriptLoader } from '@bigcommerce/script-loader';
import { getBraintreeVenmo } from '../mocks/braintree.mock';
import clearAllMocks = jest.clearAllMocks;

describe('BraintreeVenmoPaymentStrategy', () => {
    let braintreeVenmoPaymentStrategy: PaymentStrategy;
    let paymentIntegrationService: PaymentIntegrationService;
    let braintreeScriptLoader: BraintreeScriptLoader;
    let braintreeIntegrationService: BraintreeIntegrationService;
    let braintreeSDKVersionManager: BraintreeSDKVersionManager;
    let paymentMethodMock: PaymentMethod;
    let tokenizeMock: BraintreeVenmoCheckout['tokenize'];
    let options: PaymentInitializeOptions;
    const storeConfig = getConfig().storeConfig;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        braintreeSDKVersionManager = new BraintreeSDKVersionManager(paymentIntegrationService);
        braintreeScriptLoader = new BraintreeScriptLoader(
            getScriptLoader(),
            window,
            braintreeSDKVersionManager,
        );
        braintreeIntegrationService = new BraintreeIntegrationService(
            braintreeScriptLoader,
            window,
        );
        const braintreeTokenizePayload: BraintreeTokenizePayload = {
            nonce: 'sampleNonce',
            type: 'PaypalAccount',
            details: {
                username: 'sampleUsername',
                email: 'sample@example.com',
            },
        };

        tokenizeMock = jest.fn((callback) => callback(undefined, braintreeTokenizePayload));
        paymentMethodMock = { ...getBraintreeVenmo() };
        options = { methodId: paymentMethodMock.id };

        braintreeVenmoPaymentStrategy = new BraintreeVenmoPaymentStrategy(
            paymentIntegrationService,
            braintreeIntegrationService,
        );
        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            getBraintreeVenmo(),
        );
        jest.spyOn(paymentIntegrationService.getState(), 'getStoreConfigOrThrow').mockReturnValue(
            storeConfig,
        );
        jest.spyOn(braintreeScriptLoader, 'loadClient').mockResolvedValue({
            create: jest.fn().mockResolvedValue({
                request: jest.fn(),
            }),
        });
        jest.spyOn(braintreeIntegrationService, 'getVenmoCheckout').mockResolvedValue({
            tokenize: jest.fn().mockResolvedValue(tokenizeMock),
            isBrowserSupported: jest.fn(),
            teardown: jest.fn(),
        });
        jest.spyOn(braintreeIntegrationService, 'initialize');
    });

    it('creates an instance of the braintree venmo payment strategy', () => {
        expect(braintreeVenmoPaymentStrategy).toBeInstanceOf(BraintreeVenmoPaymentStrategy);
    });

    describe('#initialize()', () => {
        it('initializes the braintree venmo payment processor with the client token', async () => {
            const options = { methodId: paymentMethodMock.id };

            await braintreeVenmoPaymentStrategy.initialize(options);

            expect(braintreeIntegrationService.initialize).toHaveBeenCalledWith(
                paymentMethodMock.clientToken,
            );
            expect(braintreeIntegrationService.getVenmoCheckout).toHaveBeenCalled();
        });

        it('throws error if clientToken does not exist', async () => {
            paymentMethodMock.clientToken = undefined;
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethodMock);

            try {
                await braintreeVenmoPaymentStrategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('throw error if getVenmoCheckout fails', async () => {
            jest.spyOn(braintreeIntegrationService, 'getVenmoCheckout').mockReturnValue(
                Promise.reject({
                    name: 'notBraintreeError',
                    message: 'my_message',
                }),
            );

            try {
                await braintreeVenmoPaymentStrategy.initialize(options);
            } catch (error) {
                expect((error as Error).message).toBe('my_message');
            }
        });

        it('should initialize Venmo with an appropriate config', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getStoreConfigOrThrow',
            ).mockReturnValue({
                ...storeConfig,
                checkoutSettings: {
                    ...storeConfig.checkoutSettings,
                    features: {
                        'PAYPAL-5406.braintree_venmo_web_fallback_support': true,
                    },
                },
            });

            await braintreeVenmoPaymentStrategy.initialize(options);

            expect(braintreeIntegrationService.getVenmoCheckout).toHaveBeenCalledWith({
                mobileWebFallBack: true,
            });
        });

        it('should initialize Venmo with providing venmo options', async () => {
            await braintreeVenmoPaymentStrategy.initialize({
                ...options,
                braintreevenmo: {
                    allowDesktop: true,
                },
            });

            expect(braintreeIntegrationService.getVenmoCheckout).toHaveBeenCalledWith({
                allowDesktop: true,
                mobileWebFallBack: true,
            });
        });
    });

    describe('#execute()', () => {
        let orderRequestBody: OrderRequestBody;

        beforeEach(() => {
            jest.spyOn(paymentIntegrationService, 'submitOrder');
            jest.spyOn(braintreeIntegrationService, 'getSessionId').mockResolvedValue(
                'my_session_id',
            );
            orderRequestBody = getOrderRequestBody();
            braintreeIntegrationService.getVenmoCheckout = jest.fn(
                (): Promise<BraintreeVenmoCheckout> =>
                    Promise.resolve({
                        tokenize: tokenizeMock,
                        isBrowserSupported: () => true,
                        teardown: jest.fn(),
                    }),
            );
        });

        afterEach(() => {
            clearAllMocks();
        });

        it('calls submit order with the order request information', async () => {
            await braintreeVenmoPaymentStrategy.initialize(options);
            await braintreeVenmoPaymentStrategy.execute(orderRequestBody, options);

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith({
                useStoreCredit: false,
            });
        });

        it('refresh the state if paymentMethod has nonce value', async () => {
            paymentMethodMock.nonce = 'some-nonce';

            await braintreeVenmoPaymentStrategy.initialize(options);
            await braintreeVenmoPaymentStrategy.execute(orderRequestBody, options);

            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledTimes(1);
            expect(braintreeIntegrationService.initialize).toHaveBeenCalledTimes(1);
            expect(paymentIntegrationService.submitOrder).toHaveBeenCalledTimes(1);
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(1);
        });

        it('pass the options to submitOrder', async () => {
            await braintreeVenmoPaymentStrategy.initialize(options);
            await braintreeVenmoPaymentStrategy.execute(orderRequestBody, options);

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith({
                useStoreCredit: false,
            });
        });

        it('does not call braintreeVenmoCheckout.tokenize if a nonce is present', async () => {
            paymentMethodMock.nonce = 'some-nonce';

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethodMock);

            const expected = expect.objectContaining({
                paymentData: {
                    formattedPayload: {
                        vault_payment_instrument: null,
                        set_as_default_stored_instrument: null,
                        device_info: null,
                        paypal_account: {
                            token: 'some-nonce',
                            email: null,
                        },
                    },
                },
            });

            await braintreeVenmoPaymentStrategy.initialize({ methodId: paymentMethodMock.id });
            await braintreeVenmoPaymentStrategy.execute(orderRequestBody, options);

            expect(tokenizeMock).not.toHaveBeenCalled();
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(expected);
        });

        it('throw error after user closed modal window', async () => {
            const tokenizeMockError = jest.fn((callback) =>
                callback(
                    {
                        name: 'BraintreeError',
                        message: 'my_message',
                        code: 'PAYPAL_POPUP_CLOSED',
                    },
                    undefined,
                ),
            );

            braintreeIntegrationService.getVenmoCheckout = jest.fn(
                (): Promise<BraintreeVenmoCheckout> =>
                    Promise.resolve({
                        tokenize: tokenizeMockError,
                        isBrowserSupported: () => true,
                        teardown: jest.fn(),
                    }),
            );

            await braintreeVenmoPaymentStrategy.initialize(options);

            await expect(
                braintreeVenmoPaymentStrategy.execute(orderRequestBody, options),
            ).rejects.toEqual(expect.any(PaymentMethodCancelledError));
            expect(paymentIntegrationService.submitOrder).not.toHaveBeenCalled();
        });

        it('throw error after tokenize error', async () => {
            const tokenizeMockError = jest.fn((callback) =>
                callback(
                    {
                        name: 'BraintreeError',
                        message: 'my_message',
                    },
                    undefined,
                ),
            );

            braintreeIntegrationService.getVenmoCheckout = jest.fn(
                (): Promise<BraintreeVenmoCheckout> =>
                    Promise.resolve({
                        tokenize: tokenizeMockError,
                        isBrowserSupported: () => true,
                        teardown: jest.fn(),
                    }),
            );

            await braintreeVenmoPaymentStrategy.initialize(options);

            await expect(
                braintreeVenmoPaymentStrategy.execute(orderRequestBody, options),
            ).rejects.toEqual(expect.any(PaymentMethodFailedError));
            expect(paymentIntegrationService.submitOrder).not.toHaveBeenCalled();
        });

        it('throw error when no payment options exist', async () => {
            await braintreeVenmoPaymentStrategy.initialize(options);

            try {
                await braintreeVenmoPaymentStrategy.execute({}, options);
            } catch (error) {
                expect(error).toEqual(expect.any(PaymentArgumentInvalidError));
            }

            expect(paymentIntegrationService.submitOrder).not.toHaveBeenCalled();
        });
    });

    describe('#deinitialize()', () => {
        it('calls deinitialize in the braintree payment processor', async () => {
            braintreeIntegrationService.teardown = jest.fn(() => Promise.resolve());

            await braintreeVenmoPaymentStrategy.deinitialize();

            expect(braintreeIntegrationService.teardown).toHaveBeenCalled();
        });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            try {
                await braintreeVenmoPaymentStrategy.finalize();
            } catch (error) {
                expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
            }
        });
    });
});
