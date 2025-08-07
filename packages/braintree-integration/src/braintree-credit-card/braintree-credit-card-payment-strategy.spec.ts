import BraintreeCreditCardPaymentStrategy from './braintree-credit-card-payment-strategy';
import {
    MissingDataError,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getCart,
    getConfig,
    getOrderRequestBody,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';
import {
    BraintreeFastlane,
    BraintreeIntegrationService,
    BraintreeScriptLoader,
    BraintreeSDKVersionManager,
    getBraintree,
    getFastlaneMock,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import { getScriptLoader } from '@bigcommerce/script-loader';
import {
    getBillingAddress,
    getThreeDSecureMock,
    getThreeDSecureOptionsMock,
    getTokenizeResponseBody,
} from '../mocks/braintree.mock';
import { merge } from 'lodash';
import BraintreeHostedForm from '../braintree-hosted-form/braintree-hosted-form';
import {
    BraintreeCreditCardPaymentInitializeOptions,
    WithBraintreeCreditCardPaymentInitializeOptions,
} from './braintree-credit-card-payment-initialize-options';

describe('BraintreeCreditCardPaymentStrategy', () => {
    let braintreeCreditCardPaymentStrategy: BraintreeCreditCardPaymentStrategy;
    let paymentIntegrationService: PaymentIntegrationService;
    let braintreeIntegrationService: BraintreeIntegrationService;
    let braintreeScriptLoader: BraintreeScriptLoader;
    let braintreeHostedForm: BraintreeHostedForm;
    let paymentMethod: PaymentMethod;
    let braintreeFastlaneMock: BraintreeFastlane;
    let braintreeSDKVersionManager: BraintreeSDKVersionManager;

    beforeEach(() => {
        const methodId = 'braintree';
        paymentMethod = {
            ...getBraintree(),
            id: methodId,
            initializationData: {
                isAcceleratedCheckoutEnabled: true,
                shouldRunAcceleratedCheckout: true,
            },
        };

        paymentIntegrationService = new PaymentIntegrationServiceMock();

        braintreeSDKVersionManager = new BraintreeSDKVersionManager(paymentIntegrationService);
        braintreeScriptLoader = new BraintreeScriptLoader(
            getScriptLoader(),
            window,
            braintreeSDKVersionManager,
        );
        braintreeFastlaneMock = getFastlaneMock();
        braintreeIntegrationService = new BraintreeIntegrationService(
            braintreeScriptLoader,
            window,
        );
        braintreeHostedForm = new BraintreeHostedForm(braintreeScriptLoader);
        braintreeCreditCardPaymentStrategy = new BraintreeCreditCardPaymentStrategy(
            paymentIntegrationService,
            braintreeIntegrationService,
            braintreeHostedForm,
        );

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );
        jest.spyOn(braintreeIntegrationService, 'getSessionId').mockResolvedValue('sessionId');
        jest.spyOn(braintreeIntegrationService, 'getBraintreeFastlane').mockResolvedValue(
            braintreeFastlaneMock,
        );
        jest.spyOn(braintreeIntegrationService, 'initialize');
        braintreeScriptLoader.loadClient = jest.fn();
        jest.spyOn(braintreeScriptLoader, 'loadHostedFields').mockResolvedValue({
            create: jest.fn(),
        });
        jest.spyOn(braintreeIntegrationService, 'getClient').mockResolvedValue({
            request: jest.fn(),
        });
        jest.spyOn(braintreeHostedForm, 'initialize');
        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );
        jest.spyOn(braintreeIntegrationService, 'teardown');
        jest.spyOn(braintreeHostedForm, 'deinitialize');
        jest.spyOn(paymentIntegrationService, 'submitPayment');
        jest.spyOn(braintreeScriptLoader, 'loadHostedFields').mockResolvedValue({
            create: jest.fn(),
        });
        jest.spyOn(braintreeScriptLoader, 'loadClient').mockResolvedValue({
            create: jest.fn().mockResolvedValue({
                request: jest.fn(),
            }),
        });
        jest.spyOn(braintreeIntegrationService, 'tokenizeCard');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('creates an instance of the braintree payment strategy', () => {
        expect(braintreeCreditCardPaymentStrategy).toBeInstanceOf(
            BraintreeCreditCardPaymentStrategy,
        );
    });

    describe('#initialize()', () => {
        it('throws error if client token is missing', async () => {
            paymentMethod.clientToken = '';

            try {
                await braintreeCreditCardPaymentStrategy.initialize({
                    methodId: paymentMethod.id,
                });
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('initializes the strategy', async () => {
            paymentMethod.config.isHostedFormEnabled = false;

            const options: PaymentInitializeOptions &
                WithBraintreeCreditCardPaymentInitializeOptions = {
                braintree: {
                    form: {
                        fields: {
                            cardNumberVerification: {
                                instrumentId: 'instrument123',
                                containerId: 'containerId',
                            },
                        },
                    },
                    unsupportedCardBrands: [],
                },
                methodId: paymentMethod.id,
            };

            await braintreeCreditCardPaymentStrategy.initialize(options);

            expect(braintreeIntegrationService.initialize).toHaveBeenCalledWith(
                paymentMethod.clientToken,
            );
            expect(braintreeIntegrationService.getSessionId).toHaveBeenCalled();
            jest.spyOn(braintreeHostedForm, 'initialize');
        });
    });

    it('initializes the strategy as hosted form if feature is enabled and configuration is passed', async () => {
        paymentMethod.config.isHostedFormEnabled = true;
        jest.spyOn(braintreeHostedForm, 'isInitialized').mockReturnValue(true);

        const options = {
            methodId: paymentMethod.id,
            braintree: {
                form: {
                    fields: {
                        cardName: { containerId: 'cardName' },
                        cardNumber: { containerId: 'cardNumber' },
                        cardExpiry: { containerId: 'cardExpiry' },
                    },
                },
                unsupportedCardBrands: ['american-express', 'diners-club'],
            },
        };

        await braintreeCreditCardPaymentStrategy.initialize(options);

        expect(braintreeIntegrationService.initialize).toHaveBeenCalledWith(
            paymentMethod.clientToken,
        );
        expect(braintreeHostedForm.initialize).toHaveBeenCalledWith(
            options.braintree.form,
            options.braintree.unsupportedCardBrands,
            'clientToken',
        );
        expect(braintreeIntegrationService.getSessionId).toHaveBeenCalled();
    });

    it('initializes braintree fastlane sdk', async () => {
        const cart = getCart();
        const storeConfig = getConfig().storeConfig;

        jest.spyOn(paymentIntegrationService.getState(), 'getCartOrThrow').mockReturnValue(cart);
        jest.spyOn(paymentIntegrationService.getState(), 'getStoreConfigOrThrow').mockReturnValue(
            storeConfig,
        );
        jest.spyOn(
            paymentIntegrationService.getState(),
            'getPaymentProviderCustomer',
        ).mockReturnValue(undefined);

        paymentMethod.initializationData.isAcceleratedCheckoutEnabled = true;

        const options: PaymentInitializeOptions & WithBraintreeCreditCardPaymentInitializeOptions =
            {
                methodId: paymentMethod.id,
                braintree: {
                    form: {
                        fields: {
                            cardName: { containerId: 'cardName' },
                            cardNumber: { containerId: 'cardNumber' },
                            cardExpiry: { containerId: 'cardExpiry' },
                        },
                    },
                    unsupportedCardBrands: [],
                },
            };

        await braintreeCreditCardPaymentStrategy.initialize(options);

        expect(braintreeIntegrationService.initialize).toHaveBeenCalled();
        expect(braintreeIntegrationService.getBraintreeFastlane).toHaveBeenCalled();
    });

    describe('#deinitialize()', () => {
        it('deinitializes strategy', async () => {
            await braintreeCreditCardPaymentStrategy.deinitialize();

            expect(braintreeIntegrationService.teardown).toHaveBeenCalled();
            expect(braintreeHostedForm.deinitialize).toHaveBeenCalled();
        });

        it('resets hosted form initialization state on strategy deinitialization', async () => {
            jest.spyOn(braintreeIntegrationService, 'getClient').mockResolvedValue({
                request: jest.fn().mockResolvedValue(getTokenizeResponseBody()),
            });
            jest.spyOn(braintreeHostedForm, 'tokenize');
            braintreeHostedForm.deinitialize = jest.fn(() => Promise.resolve());
            paymentMethod.config.isHostedFormEnabled = true;

            await braintreeCreditCardPaymentStrategy.initialize({
                methodId: paymentMethod.id,
                braintree: {
                    form: {
                        fields: {
                            cardName: { containerId: 'cardName' },
                            cardNumber: { containerId: 'cardNumber' },
                            cardExpiry: { containerId: 'cardExpiry' },
                        },
                    },
                    unsupportedCardBrands: [],
                },
            });

            await braintreeCreditCardPaymentStrategy.deinitialize();
            await braintreeCreditCardPaymentStrategy.execute(getOrderRequestBody());

            expect(braintreeHostedForm.tokenize).not.toHaveBeenCalled();
            expect(braintreeIntegrationService.teardown).toHaveBeenCalled();
        });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            try {
                await braintreeCreditCardPaymentStrategy.finalize();
            } catch (error) {
                expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
            }
        });
    });

    describe('#execute()', () => {
        let orderRequestBody: OrderRequestBody;

        beforeEach(() => {
            orderRequestBody = getOrderRequestBody();
        });

        describe('common execution behaviour', () => {
            it('calls submit order with the order request information', async () => {
                jest.spyOn(braintreeIntegrationService, 'getClient').mockResolvedValue({
                    request: jest.fn().mockResolvedValue(getTokenizeResponseBody()),
                });

                await braintreeCreditCardPaymentStrategy.execute(getOrderRequestBody());

                expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
            });

            describe('non hosted form behaviour', () => {
                it('passes on optional flags to save and to make default', async () => {
                    jest.spyOn(braintreeIntegrationService, 'getClient').mockResolvedValue({
                        request: jest.fn().mockResolvedValue(getTokenizeResponseBody()),
                    });

                    const payload = merge({}, getOrderRequestBody(), {
                        payment: {
                            paymentData: {
                                shouldSaveInstrument: true,
                                shouldSetAsDefaultInstrument: true,
                            },
                        },
                    });

                    await braintreeCreditCardPaymentStrategy.execute(payload);

                    expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                        expect.objectContaining({
                            paymentData: expect.objectContaining({
                                shouldSaveInstrument: true,
                                shouldSetAsDefaultInstrument: true,
                            }),
                        }),
                    );
                });

                it('does nothing to VaultedInstruments', async () => {
                    const payload = {
                        ...getOrderRequestBody(),
                        payment: {
                            methodId: 'braintree',
                            paymentData: {
                                instrumentId: 'my_instrument_id',
                                iin: '123123',
                            },
                        },
                    };

                    await braintreeCreditCardPaymentStrategy.execute(payload);

                    expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                        payload.payment,
                    );
                });

                it('tokenizes the card', async () => {
                    jest.spyOn(paymentIntegrationService, 'submitPayment');
                    jest.spyOn(braintreeHostedForm, 'tokenize');
                    jest.spyOn(braintreeIntegrationService, 'getClient').mockResolvedValue({
                        request: jest.fn().mockResolvedValue(getTokenizeResponseBody()),
                    });
                    const expected = {
                        ...getOrderRequestBody().payment,
                        paymentData: {
                            deviceSessionId: 'sessionId',
                            nonce: 'demo_nonce',
                            shouldSaveInstrument: false,
                            shouldSetAsDefaultInstrument: false,
                        },
                    };

                    await braintreeCreditCardPaymentStrategy.initialize({
                        methodId: paymentMethod.id,
                    });
                    await braintreeCreditCardPaymentStrategy.execute(getOrderRequestBody());

                    expect(braintreeIntegrationService.tokenizeCard).toHaveBeenCalledWith(
                        getOrderRequestBody().payment,
                        getBillingAddress(),
                    );
                    expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(expected);
                });

                it('verifies the card if 3ds is enabled', async () => {
                    jest.spyOn(braintreeIntegrationService, 'get3DS').mockResolvedValue({
                        ...getThreeDSecureMock(),
                    });
                    jest.spyOn(braintreeIntegrationService, 'verifyCard').mockResolvedValue({
                        nonce: 'demo_nonce',
                    });
                    jest.spyOn(braintreeIntegrationService, 'getClient').mockResolvedValue({
                        request: jest.fn().mockResolvedValue(getTokenizeResponseBody()),
                    });
                    const options3ds = {
                        methodId: paymentMethod.id,
                        braintree: {
                            threeDSecure: getThreeDSecureOptionsMock(),
                            form: {
                                fields: {},
                                cardCodeVerification: {
                                    instrumentId: 'my_instrument_id',
                                    containerId: 'my_container_id',
                                },
                            },
                            unsupportedCardBrands: [],
                        },
                    };

                    paymentMethod.config.is3dsEnabled = true;

                    await braintreeCreditCardPaymentStrategy.initialize(options3ds);

                    const expected = {
                        ...getOrderRequestBody().payment,
                        paymentData: {
                            deviceSessionId: 'sessionId',
                            nonce: 'demo_nonce',
                            shouldSaveInstrument: false,
                            shouldSetAsDefaultInstrument: false,
                        },
                    };

                    await braintreeCreditCardPaymentStrategy.execute(getOrderRequestBody());
                    expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(expected);
                });
            });
        });

        describe('hosted form behaviour', () => {
            let initializeOptions: BraintreeCreditCardPaymentInitializeOptions;

            beforeEach(() => {
                jest.spyOn(braintreeHostedForm, 'tokenizeForStoredCardVerification');
                jest.spyOn(braintreeHostedForm, 'tokenize');
                jest.spyOn(braintreeScriptLoader, 'loadHostedFields').mockResolvedValue({
                    create: jest.fn().mockReturnValue({
                        on: jest.fn(),
                        getState: jest.fn().mockReturnValue({
                            fields: {},
                        }),
                        tokenize: jest.fn().mockResolvedValue({
                            nonce: 'my_tokenized_card_with_hosted_form',
                        }),
                    }),
                });

                initializeOptions = {
                    form: {
                        fields: {
                            cardName: { containerId: 'cardName' },
                            cardNumber: { containerId: 'cardNumber' },
                            cardExpiry: { containerId: 'cardExpiry' },
                        },
                    },
                    unsupportedCardBrands: [],
                };

                paymentMethod.config.isHostedFormEnabled = true;
            });

            it('tokenizes payment data through hosted form and submits it', async () => {
                await braintreeCreditCardPaymentStrategy.initialize({
                    methodId: paymentMethod.id,
                    braintree: initializeOptions,
                });

                await braintreeCreditCardPaymentStrategy.execute(orderRequestBody);

                expect(braintreeHostedForm.tokenize).toHaveBeenCalledWith(getBillingAddress());

                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                    ...orderRequestBody.payment,
                    paymentData: {
                        deviceSessionId: 'sessionId',
                        nonce: 'my_tokenized_card_with_hosted_form',
                        shouldSaveInstrument: false,
                        shouldSetAsDefaultInstrument: false,
                    },
                });
            });

            it('passes save instrument flags if set', async () => {
                const payload = merge({}, orderRequestBody, {
                    payment: {
                        paymentData: {
                            shouldSaveInstrument: true,
                            shouldSetAsDefaultInstrument: true,
                        },
                    },
                });

                await braintreeCreditCardPaymentStrategy.initialize({
                    methodId: paymentMethod.id,
                    braintree: initializeOptions,
                });

                await braintreeCreditCardPaymentStrategy.execute(payload);

                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                    expect.objectContaining({
                        paymentData: expect.objectContaining({
                            shouldSaveInstrument: true,
                            shouldSetAsDefaultInstrument: true,
                        }),
                    }),
                );
            });

            it('does nothing to VaultedInstruments', async () => {
                const payload = {
                    ...orderRequestBody,
                    payment: {
                        methodId: paymentMethod.id,
                        paymentData: {
                            instrumentId: 'my_instrument_id',
                        },
                    },
                };

                await braintreeCreditCardPaymentStrategy.execute(payload);

                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                    payload.payment,
                );
            });
        });
    });
});
