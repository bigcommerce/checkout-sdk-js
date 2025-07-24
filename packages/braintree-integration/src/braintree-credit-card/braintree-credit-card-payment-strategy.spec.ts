import BraintreeCreditCardPaymentStrategy from './braintree-credit-card-payment-strategy';
import {
    MissingDataError, OrderFinalizationNotRequiredError,
    PaymentIntegrationService,
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
    BraintreePaymentProcessor,
    BraintreeScriptLoader, BraintreeSDKVersionManager,
    getBraintree,
    getFastlaneMock,
    getHostedFieldsMock,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    BraintreeHostedForm,
    BraintreePaymentInitializeOptions,
} from '@bigcommerce/checkout-sdk/braintree-integration';
import { getScriptLoader } from '@bigcommerce/script-loader';
import {
    getBillingAddress, getModuleCreatorMock,
    getThreeDSecureMock,
    getThreeDSecureOptionsMock,
    getTokenizeResponseBody,
} from '../mocks/braintree.mock';
import { merge } from 'lodash';

describe('BraintreeCreditCardPaymentStrategy', () => {
    let braintreeCreditCardPaymentStrategy: BraintreeCreditCardPaymentStrategy;
    let paymentIntegrationService: PaymentIntegrationService;
    let braintreePaymentProcessor: BraintreePaymentProcessor;
    let braintreeIntegrationService: BraintreeIntegrationService;
    let braintreeScriptLoader: BraintreeScriptLoader;
    let braintreeHostedForm: BraintreeHostedForm;
    let paymentMethod: any; // TODO: FIX
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
        braintreeSDKVersionManager = new BraintreeSDKVersionManager(paymentIntegrationService);
        braintreeScriptLoader = new BraintreeScriptLoader(
            getScriptLoader(),
            window,
            braintreeSDKVersionManager,
        );
        braintreeFastlaneMock = getFastlaneMock();
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        braintreeIntegrationService = new BraintreeIntegrationService(
            braintreeScriptLoader,
            window,
        );
        braintreeHostedForm = new BraintreeHostedForm(braintreeIntegrationService, braintreeScriptLoader);
        braintreePaymentProcessor = new BraintreePaymentProcessor(
            braintreeIntegrationService,
            braintreeHostedForm,
        );
        braintreeCreditCardPaymentStrategy = new BraintreeCreditCardPaymentStrategy(
            paymentIntegrationService,
           braintreePaymentProcessor,
            braintreeIntegrationService,
       );
        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );
        jest.spyOn(braintreeIntegrationService, 'getSessionId').mockResolvedValue('sessionId');
        jest.spyOn(braintreeIntegrationService, 'getBraintreeFastlane').mockResolvedValue(braintreeFastlaneMock);
        jest.spyOn(braintreePaymentProcessor, 'initializeHostedForm');
        jest.spyOn(braintreePaymentProcessor, 'initialize');
        jest.spyOn(braintreeIntegrationService, 'initialize');
        jest.spyOn(braintreePaymentProcessor, 'isInitializedHostedForm');
        braintreeScriptLoader.loadClient = jest.fn();
        jest.spyOn(braintreeScriptLoader, 'loadHostedFields').mockResolvedValue({
            create: jest.fn(),
        });
        jest.spyOn(braintreeIntegrationService, 'getClient').mockResolvedValue({
            request: jest.fn(),
            getVersion: jest.fn(),
        });
        jest.spyOn(braintreeHostedForm, 'initialize');
        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );
        jest.spyOn(braintreeIntegrationService, 'teardown');
        jest.spyOn(braintreePaymentProcessor, 'deinitializeHostedForm');
        jest.spyOn(paymentIntegrationService, 'submitPayment');
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

            const options = { braintree: {}, methodId: paymentMethod.id };

            await braintreeCreditCardPaymentStrategy.initialize(options);

            expect(braintreeIntegrationService.initialize).toHaveBeenCalledWith(
                paymentMethod.clientToken,
            );
            expect(braintreePaymentProcessor.initializeHostedForm).not.toHaveBeenCalled();
            expect(braintreePaymentProcessor.isInitializedHostedForm).not.toHaveBeenCalled();
            expect(braintreeIntegrationService.getSessionId).toHaveBeenCalled();
            jest.spyOn(braintreeHostedForm, 'initialize');
        });
    });

    it('initializes the strategy as hosted form if feature is enabled and configuration is passed', async () => {
        paymentMethod.config.isHostedFormEnabled = true;
        jest.spyOn(braintreePaymentProcessor, 'isInitializedHostedForm').mockReturnValue(true);

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
        expect(braintreePaymentProcessor.initializeHostedForm).toHaveBeenCalledWith(
            options.braintree.form,
            options.braintree.unsupportedCardBrands,
        );
        expect(braintreePaymentProcessor.isInitializedHostedForm).toHaveBeenCalled();
        expect(braintreeIntegrationService.getSessionId).toHaveBeenCalled();
    });

    it('initializes braintree fastlane sdk', async () => {
        const cart = getCart();
        const storeConfig = getConfig().storeConfig;

        jest.spyOn(paymentIntegrationService.getState(), 'getCartOrThrow').mockReturnValue(cart);
        jest.spyOn(paymentIntegrationService.getState(), 'getStoreConfigOrThrow').mockReturnValue(storeConfig);
        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentProviderCustomer').mockReturnValue(
            undefined,
        );

        paymentMethod.initializationData.isAcceleratedCheckoutEnabled = true;

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
            expect(braintreePaymentProcessor.deinitializeHostedForm).toHaveBeenCalled();
        });

        it('resets hosted form initialization state on strategy deinitialization', async () => {
            jest.spyOn(braintreeIntegrationService, 'getClient').mockResolvedValue({
               request: jest.fn().mockResolvedValue(getTokenizeResponseBody()),
                getVersion: jest.fn(),
            });
            jest.spyOn(braintreePaymentProcessor, 'tokenizeHostedForm');
            jest.spyOn(braintreePaymentProcessor, 'tokenizeCard');
            braintreePaymentProcessor.deinitialize = jest.fn(() => Promise.resolve());
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
                },
            });

            await braintreeCreditCardPaymentStrategy.deinitialize();
            await braintreeCreditCardPaymentStrategy.execute(getOrderRequestBody());

            expect(braintreePaymentProcessor.tokenizeHostedForm).not.toHaveBeenCalled();
            expect(braintreePaymentProcessor.tokenizeCard).toHaveBeenCalled();
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
        describe('common execution behaviour', () => {
            it('calls submit order with the order request information', async () => {
                jest.spyOn(braintreeIntegrationService, 'getClient').mockResolvedValue({
                    request: jest.fn().mockResolvedValue(getTokenizeResponseBody()),
                    getVersion: jest.fn(),
                });

                await braintreeCreditCardPaymentStrategy.execute(getOrderRequestBody());

                expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
            });

            describe('non hosted form behaviour', () => {
                it('passes on optional flags to save and to make default', async () => {
                    jest.spyOn(braintreeIntegrationService, 'getClient').mockResolvedValue({
                        request: jest.fn().mockResolvedValue(getTokenizeResponseBody()),
                        getVersion: jest.fn(),
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

                    expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(payload.payment);
                });

                it('tokenizes the card', async () => {
                    jest.spyOn(paymentIntegrationService, 'submitPayment');
                    jest.spyOn(braintreePaymentProcessor, 'tokenizeCard');
                    jest.spyOn(braintreeIntegrationService, 'getClient').mockResolvedValue({
                        request: jest.fn().mockResolvedValue(getTokenizeResponseBody()),
                        getVersion: jest.fn(),
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

                    expect(braintreePaymentProcessor.tokenizeCard).toHaveBeenCalledWith(
                        getOrderRequestBody().payment,
                        getBillingAddress(),
                    );
                    expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(expected);
                });

                it('verifies the card if 3ds is enabled', async () => {
                    jest.spyOn(braintreeIntegrationService, 'get3DS').mockResolvedValue({
                        ...getThreeDSecureMock(),
                    });
                    jest.spyOn(braintreePaymentProcessor, 'verifyCard').mockResolvedValue({
                        nonce: 'demo_nonce',
                    });
                    jest.spyOn(braintreeIntegrationService, 'getClient').mockResolvedValue({
                        request: jest.fn().mockResolvedValue(getTokenizeResponseBody()),
                        getVersion: jest.fn(),
                    });
                    const options3ds = {
                        methodId: paymentMethod.id,
                        braintree: {
                            threeDSecure: getThreeDSecureOptionsMock(),
                        }
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

                    expect(braintreePaymentProcessor.verifyCard).toHaveBeenCalledWith(
                        getOrderRequestBody().payment,
                        getBillingAddress(),
                        190,
                    );
                    expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(expected);
                });
            });
        });

        describe('hosted form behaviour', () => {
            let initializeOptions: BraintreePaymentInitializeOptions;

            beforeEach(() => {
                initializeOptions = {
                    form: {
                        fields: {
                            cardName: { containerId: 'cardName' },
                            cardNumber: { containerId: 'cardNumber' },
                            cardExpiry: { containerId: 'cardExpiry' },
                        },
                    },
                };

                paymentMethod.config.isHostedFormEnabled = true;
            });

            it('tokenizes payment data through hosted form and submits it', async () => {
                jest.spyOn(braintreePaymentProcessor, 'validateHostedForm');
                const hostedFieldsMock = getHostedFieldsMock();
                const hostedFieldsCreatorMock = getModuleCreatorMock(hostedFieldsMock);
                jest.spyOn(braintreeScriptLoader, 'loadHostedFields').mockResolvedValue(
                    //@ts-ignore
                   hostedFieldsCreatorMock,
                );
                jest.spyOn(braintreeHostedForm, 'createHostedFields').mockResolvedValue({
                    getState: jest.fn().mockResolvedValue({
                        cards: [{
                            type: 'card',
                            niceType: 'card',
                            code: {
                                name: 'card',
                                size: 2 },
                        }],
                        emittedBy: '',
                        fields: {
                            number: {
                                container: 'div',
                                isFocused: true,
                                isEmpty: false,
                                isPotentiallyValid: true,
                                isValid: true,
                            },
                        },
                    }),
                    teardown: jest.fn(),
                    tokenize: jest.fn(),
                    on: jest.fn(),
                })
                await braintreeCreditCardPaymentStrategy.initialize({
                    methodId: paymentMethod.id,
                    braintree: initializeOptions,
                });

                await braintreeCreditCardPaymentStrategy.execute(getOrderRequestBody());

                expect(braintreePaymentProcessor.tokenizeHostedForm).toHaveBeenCalledWith(
                    getBillingAddress(),
                );

                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                    ...getOrderRequestBody().payment,
                    paymentData: {
                        deviceSessionId: 'my_session_id',
                        nonce: 'my_tokenized_card_with_hosted_form',
                        shouldSaveInstrument: false,
                        shouldSetAsDefaultInstrument: false,
                    },
                });
            });
        });
    });
});
