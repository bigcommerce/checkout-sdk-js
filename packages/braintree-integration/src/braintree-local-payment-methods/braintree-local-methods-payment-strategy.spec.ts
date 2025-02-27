import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    BraintreeLocalPayment,
    BraintreeScriptLoader,
    BraintreeSdk,
    getBraintreeLocalPaymentMock,
    getDataCollectorMock,
    NonInstantLocalPaymentMethods,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    InvalidArgumentError,
    MissingDataError,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethod,
    PaymentMethodInvalidError,
    RequestError,
    StoreConfig,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getCheckout,
    getConfig,
    getResponse,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import {
    getBraintreeLocalMethods,
    getBraintreeLocalMethodsInitializationOptions,
} from '../mocks/braintree.mock';

import BraintreeLocalMethodsPaymentStrategy from './braintree-local-methods-payment-strategy';

describe('BraintreeLocalMethodsPaymentStrategy', () => {
    let strategy: BraintreeLocalMethodsPaymentStrategy;
    let paymentIntegrationService: PaymentIntegrationService;
    let braintreeLocalPaymentMock: BraintreeLocalPayment;
    let braintreeSdk: BraintreeSdk;
    let braintreeScriptLoader: BraintreeScriptLoader;
    let paymentMethodMock: PaymentMethod;
    let storeConfigMock: StoreConfig;
    let loadingIndicator: LoadingIndicator;
    let lpmButton: HTMLButtonElement;
    let lpmContainer: HTMLElement;
    const sessionId = getDataCollectorMock().deviceData;

    const instantPaymentMethodId = 'ideal';
    const defaultOrderId = '123';

    const braintreelocalmethods = getBraintreeLocalMethodsInitializationOptions();

    const initializationOptions: PaymentInitializeOptions = {
        methodId: instantPaymentMethodId,
        gatewayId: 'braintreelocalmethods',
        braintreelocalmethods,
    };

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        braintreeScriptLoader = new BraintreeScriptLoader(getScriptLoader(), window);
        braintreeSdk = new BraintreeSdk(braintreeScriptLoader);
        loadingIndicator = new LoadingIndicator();
        strategy = new BraintreeLocalMethodsPaymentStrategy(
            paymentIntegrationService,
            braintreeSdk,
            loadingIndicator,
        );

        lpmContainer = document.createElement('div');
        lpmContainer.id = 'checkout-payment-continue';
        document.body.appendChild(lpmContainer);

        lpmButton = document.createElement('button');
        lpmButton.id = instantPaymentMethodId;
        document.body.appendChild(lpmButton);

        paymentMethodMock = {
            ...getBraintreeLocalMethods(),
            clientToken: 'token',
        };

        storeConfigMock = getConfig().storeConfig;
        storeConfigMock.checkoutSettings.features = {
            'PAYPAL-4853.add_new_payment_flow_for_braintree_lpms': true,
        };

        braintreeLocalPaymentMock = getBraintreeLocalPaymentMock(
            defaultOrderId,
            async () => {},
            undefined,
        );

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethodMock,
        );
        jest.spyOn(paymentIntegrationService.getState(), 'getCheckoutOrThrow').mockReturnValue(
            getCheckout(),
        );
        jest.spyOn(paymentIntegrationService.getState(), 'getStoreConfigOrThrow').mockReturnValue(
            storeConfigMock,
        );

        jest.spyOn(paymentIntegrationService, 'submitOrder');

        jest.spyOn(loadingIndicator, 'show').mockImplementation(jest.fn);
        jest.spyOn(loadingIndicator, 'hide').mockImplementation(jest.fn);

        jest.spyOn(braintreeSdk, 'initialize');
        jest.spyOn(braintreeSdk, 'getDataCollectorOrThrow').mockImplementation(() =>
            Promise.resolve(getDataCollectorMock()),
        );

        jest.spyOn(braintreeSdk, 'getBraintreeLocalPayment').mockResolvedValue(
            braintreeLocalPaymentMock,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();

        document.body.removeChild(lpmButton);
        document.body.removeChild(lpmContainer);
    });

    it('creates BraintreeLocalMethodsPaymentStrategy', () => {
        expect(strategy).toBeInstanceOf(BraintreeLocalMethodsPaymentStrategy);
    });

    describe('#initialize', () => {
        it('throws error when methodId is not provided', async () => {
            const options = {} as PaymentInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws error when gatewayId is not provided', async () => {
            const options = {
                methodId: instantPaymentMethodId,
            } as PaymentInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws error if options.braintreelocalmethods is not provided', async () => {
            const options = {
                methodId: instantPaymentMethodId,
                gatewayId: 'braintreelocalmethods',
            } as PaymentInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws error if clientToken is not provided (instant payment method only)', async () => {
            paymentMethodMock.clientToken = '';
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethodMock);

            try {
                await strategy.initialize(initializationOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('throws error if merchantId is not provided (instant payment method only)', async () => {
            paymentMethodMock.config.merchantId = undefined;
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethodMock);

            try {
                await strategy.initialize(initializationOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('throws error if initializationData is not provided (instant payment method only)', async () => {
            paymentMethodMock.initializationData = null;
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethodMock);

            try {
                await strategy.initialize(initializationOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('initializes braintree integration service (instant payment method only)', async () => {
            await strategy.initialize(initializationOptions);

            expect(braintreeSdk.initialize).toHaveBeenCalledWith(paymentMethodMock.clientToken);
        });

        it('does not load BraintreeLocalMethods for non-instant payment methods', async () => {
            await strategy.initialize({
                ...initializationOptions,
                methodId: NonInstantLocalPaymentMethods.TRUSTLY,
            });

            expect(braintreeSdk.getBraintreeLocalPayment).not.toHaveBeenCalled();
        });

        it('loads BraintreeLocalMethods (instant payment method only)', async () => {
            await strategy.initialize(initializationOptions);

            expect(braintreeSdk.getBraintreeLocalPayment).toHaveBeenCalledWith(
                paymentMethodMock.config.merchantId,
            );
        });

        it('performs error handling flow when there is an error while getting braintree local payment sdk', async () => {
            jest.spyOn(braintreeSdk, 'getBraintreeLocalPayment').mockImplementationOnce(() => {
                throw new Error('error');
            });

            await strategy.initialize(initializationOptions);

            expect(braintreelocalmethods?.onError).toHaveBeenCalled();
        });
    });

    describe('#deinitialize', () => {
        it('deinitializes strategy', async () => {
            await expect(strategy.deinitialize()).resolves.not.toThrow();
        });
    });

    describe('#finalize', () => {
        it('throws error to inform that order finalization is not required', async () => {
            await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
        });
    });

    describe('#execute', () => {
        it('throws an error if payload.payment is not provided', async () => {
            try {
                await strategy.execute({});
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentArgumentInvalidError);
            }
        });

        it('throws PaymentArgumentInvalidError if payment is not provided', async () => {
            await expect(strategy.execute({})).rejects.toThrow(PaymentArgumentInvalidError);
        });

        describe('when instant payment method', () => {
            let payload: OrderRequestBody;

            beforeEach(() => {
                payload = {
                    payment: {
                        gatewayId: 'braintreelocalmethods',
                        methodId: instantPaymentMethodId,
                    },
                };
            });

            it('should call startPayment method from Braintree local payment methods instance', async () => {
                braintreeLocalPaymentMock = getBraintreeLocalPaymentMock(
                    defaultOrderId,
                    async () => {},
                    undefined,
                );

                jest.spyOn(braintreeSdk, 'getBraintreeLocalPayment').mockResolvedValue(
                    braintreeLocalPaymentMock,
                );

                await strategy.initialize(initializationOptions);
                await strategy.execute(payload);

                expect(braintreeLocalPaymentMock.startPayment).toHaveBeenCalledWith(
                    {
                        address: {
                            countryCode: 'US',
                        },
                        amount: 190,
                        currencyCode: 'USD',
                        email: 'foo@bar.com',
                        fallback: {
                            buttonText: 'Complete Payment',
                            url: 'url-placeholder',
                        },
                        givenName: 'Test',
                        surname: 'Tester',
                        onPaymentStart: expect.any(Function),
                        paymentType: instantPaymentMethodId,
                        shippingAddressRequired: true,
                    },
                    expect.any(Function),
                );
            });

            it('starts Braintree LPM flow (opens popup) when orderId was successfully saved on BE side', async () => {
                const startPaymentMock = jest.fn();

                const error = new RequestError(
                    getResponse({
                        additional_action_required: {
                            data: {
                                order_id_saved_successfully: true,
                            },
                        },
                    }),
                );

                jest.spyOn(paymentIntegrationService, 'submitPayment')
                    .mockReturnValueOnce(Promise.reject(error))
                    .mockReturnValueOnce(Promise.resolve(paymentIntegrationService.getState()));

                braintreeLocalPaymentMock = getBraintreeLocalPaymentMock(
                    defaultOrderId,
                    () => {
                        startPaymentMock();

                        return Promise.resolve();
                    },
                    undefined,
                );

                jest.spyOn(braintreeSdk, 'getBraintreeLocalPayment').mockResolvedValue(
                    braintreeLocalPaymentMock,
                );

                await strategy.initialize(initializationOptions);
                await strategy.execute(payload);

                expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
                expect(paymentIntegrationService.submitPayment).toHaveBeenCalled();
                expect(startPaymentMock).toHaveBeenCalled();
            });

            it('triggers onError callback when there is an issue with Braintree LPM payment flow', async () => {
                jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValue(
                    Promise.resolve(paymentIntegrationService.getState()),
                );

                braintreeLocalPaymentMock = getBraintreeLocalPaymentMock(
                    defaultOrderId,
                    async () => {},
                    {
                        code: 'non close window lpm flow error',
                    },
                );

                jest.spyOn(braintreeSdk, 'getBraintreeLocalPayment').mockResolvedValue(
                    braintreeLocalPaymentMock,
                );

                await strategy.initialize(initializationOptions);

                try {
                    await strategy.execute(payload);
                } catch (error: unknown) {
                    expect(error).toBeInstanceOf(PaymentMethodInvalidError);
                }
            });

            it('hides loader and does not throw anything when customer close popup window', async () => {
                jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValue(
                    Promise.resolve(paymentIntegrationService.getState()),
                );

                braintreeLocalPaymentMock = getBraintreeLocalPaymentMock(
                    defaultOrderId,
                    async () => {},
                    {
                        code: 'LOCAL_PAYMENT_WINDOW_CLOSED',
                    },
                );

                jest.spyOn(braintreeSdk, 'getBraintreeLocalPayment').mockResolvedValue(
                    braintreeLocalPaymentMock,
                );

                await strategy.initialize(initializationOptions);

                try {
                    await strategy.execute(payload);
                } catch (error: unknown) {
                    expect(error).toBeUndefined();
                    expect(loadingIndicator.hide).toHaveBeenCalled();
                }
            });
        });

        describe('when non-instant payment method', () => {
            let payload: OrderRequestBody;

            beforeEach(() => {
                payload = {
                    payment: {
                        gatewayId: 'braintreelocalmethods',
                        methodId: NonInstantLocalPaymentMethods.TRUSTLY,
                    },
                };

                Object.defineProperty(window, 'location', {
                    value: {
                        replace: jest.fn(),
                    },
                });
            });

            it('should not use startPayment method', async () => {
                await strategy.execute(payload);

                expect(braintreeLocalPaymentMock.startPayment).not.toHaveBeenCalled();
            });

            it('submits order payload with payment data', async () => {
                await strategy.execute(payload);

                expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
            });

            it('submits payment payload with payment data', async () => {
                await strategy.execute(payload);

                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                    expect.objectContaining({
                        methodId: 'trustly',
                        paymentData: expect.objectContaining({
                            deviceSessionId: sessionId,
                            formattedPayload: {
                                method: NonInstantLocalPaymentMethods.TRUSTLY,
                            },
                        }),
                    }),
                );
            });

            it('when submit payment returns additional action required specific error', async () => {
                const error = new RequestError(
                    getResponse({
                        additional_action_required: {
                            type: 'offsite_redirect',
                            data: {
                                redirect_url: 'redirect_url',
                            },
                        },
                    }),
                );

                jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementation(() =>
                    Promise.reject(error),
                );

                try {
                    await strategy.execute(payload);
                } catch (_) {
                    expect(window.location.replace).toHaveBeenCalledWith('redirect_url');
                }
            });

            it('does not perform additional action when error has invalid shape #1', async () => {
                const error = new RequestError(getResponse(undefined));

                jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementation(() =>
                    Promise.reject(error),
                );

                try {
                    await strategy.execute(payload);
                } catch (_) {
                    expect(window.location.replace).not.toHaveBeenCalled();
                }
            });

            it('does not perform additional action when error has invalid shape #2', async () => {
                const error = null;

                jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementation(() =>
                    Promise.reject(error),
                );

                try {
                    await strategy.execute(payload);
                } catch (_) {
                    expect(window.location.replace).not.toHaveBeenCalled();
                }
            });

            it('does not perform additional action when error has invalid shape #3', async () => {
                const error = new RequestError(
                    getResponse({
                        additional_action_required: undefined,
                    }),
                );

                jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementation(() =>
                    Promise.reject(error),
                );

                try {
                    await strategy.execute(payload);
                } catch (_) {
                    expect(window.location.replace).not.toHaveBeenCalled();
                }
            });

            it('toggles loading indicator and throws an error when error is not an instance of additional action required', async () => {
                jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementation(() =>
                    Promise.reject(new Error('submit payment error')),
                );

                try {
                    await strategy.execute(payload);
                } catch (error: unknown) {
                    expect(loadingIndicator.hide).toHaveBeenCalled();
                    expect(error).toBeInstanceOf(Error);
                }
            });
        });
    });
});
