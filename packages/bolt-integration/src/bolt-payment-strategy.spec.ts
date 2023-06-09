import { createScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';
import localStorageFallback from 'local-storage-fallback';

import { AnalyticsExtraItemsManager } from '@bigcommerce/checkout-sdk/analytics';
import {
    Checkout,
    InvalidArgumentError,
    MissingDataError,
    NotInitializedError,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethodCancelledError,
    PaymentMethodFailedError,
    PaymentMethodInvalidError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getCheckout,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import {
    BoltCheckout,
    BoltDeveloperMode,
    BoltEmbedded,
    BoltEmbeddedTokenize,
    BoltEmbededField,
    BoltPaymentMethod,
} from './bolt';
import { WithBoltPaymentInitializeOptions } from './bolt-payment-initialize-options';
import BoltPaymentStrategy from './bolt-payment-strategy';
import BoltScriptLoader from './bolt-script-loader';
import { getBolt, getBoltClientScriptMock, getBoltEmbeddedScriptMock } from './bolt.mock';

describe('BoltPaymentStrategy', () => {
    let boltClientScriptInitializationOptions: PaymentInitializeOptions;
    let scriptLoader: ScriptLoader;
    let paymentIntegrationService: PaymentIntegrationService;
    let boltScriptLoader: BoltScriptLoader;
    let paymentMethodMock: BoltPaymentMethod;
    let strategy: BoltPaymentStrategy;
    let boltClient: BoltCheckout;
    let boltEmbedded: BoltEmbedded;
    let boltEmbeddedField: BoltEmbededField;
    let boltEmbeddedFieldTokenizeResponse: BoltEmbeddedTokenize;
    let boltEmbeddedScriptInitializationOptions: PaymentInitializeOptions &
        WithBoltPaymentInitializeOptions;
    let boltTakeOverInitializationOptions: PaymentInitializeOptions;
    let payload: OrderRequestBody;
    let checkoutMock: Checkout;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        scriptLoader = createScriptLoader();
        boltScriptLoader = new BoltScriptLoader(scriptLoader);
        paymentMethodMock = getBolt();
        boltClientScriptInitializationOptions = {
            methodId: 'bolt',
            bolt: {
                useBigCommerceCheckout: true,
            },
        };
        boltEmbeddedFieldTokenizeResponse = {
            bin: '1111',
            expiration: '2022-11',
            last4: '1111',
            postal_code: undefined,
            token: 'token',
            token_type: 'bolt',
        };
        boltEmbeddedScriptInitializationOptions = {
            methodId: 'bolt',
            bolt: {
                containerId: 'bolt-embedded',
                onPaymentSelect: jest.fn(),
                useBigCommerceCheckout: true,
            },
        };
        boltTakeOverInitializationOptions = {
            methodId: 'bolt',
        };
        payload = {
            payment: {
                methodId: 'bolt',
                paymentData: {
                    nonce: 'transactionReference',
                },
            },
        };
        boltClient = getBoltClientScriptMock(true);
        boltEmbedded = getBoltEmbeddedScriptMock();
        boltEmbeddedField = boltEmbedded.create('payment_field');
        checkoutMock = getCheckout();

        jest.spyOn(boltScriptLoader, 'loadBoltClient').mockResolvedValue(boltClient);
        jest.spyOn(boltScriptLoader, 'loadBoltEmbedded').mockResolvedValue(boltEmbedded);
        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethodMock,
        );
        jest.spyOn(boltEmbedded, 'create').mockReturnValue(boltEmbeddedField);
        jest.spyOn(boltEmbeddedField, 'tokenize').mockReturnValue(
            boltEmbeddedFieldTokenizeResponse,
        );
        jest.spyOn(paymentIntegrationService.getState(), 'getCheckoutOrThrow').mockReturnValue(
            checkoutMock,
        );

        strategy = new BoltPaymentStrategy(
            paymentIntegrationService,
            boltScriptLoader,
            new AnalyticsExtraItemsManager(localStorageFallback),
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('#initialize', () => {
        it('successfully initializes the bolt strategy and loads the bolt client', async () => {
            await strategy.initialize(boltClientScriptInitializationOptions);

            expect(boltScriptLoader.loadBoltClient).toHaveBeenCalledWith(
                'publishableKey',
                true,
                undefined,
            );
        });

        it('successfully initializes the bolt strategy and loads the bolt client with developer params', async () => {
            paymentMethodMock.initializationData!.developerConfig = {
                developerMode: 'bolt_sandbox' as BoltDeveloperMode,
                developerDomain: '',
            };

            await strategy.initialize(boltClientScriptInitializationOptions);

            expect(boltScriptLoader.loadBoltClient).toHaveBeenCalledWith(
                'publishableKey',
                true,
                paymentMethodMock.initializationData?.developerConfig,
            );
        });

        it('fails to initialize the bolt strategy and load bolt embedded script if method id is not provided', async () => {
            const initializationOptions = {
                bolt: {
                    containerId: undefined,
                    useBigCommerceCheckout: true,
                    onPaymentSelect: jest.fn(),
                },
            };

            await expect(strategy.initialize(initializationOptions)).rejects.toThrow(
                InvalidArgumentError,
            );
            expect(boltScriptLoader.loadBoltEmbedded).not.toHaveBeenCalled();
            expect(boltClient.hasBoltAccount).not.toHaveBeenCalled();
            expect(initializationOptions.bolt.onPaymentSelect).not.toHaveBeenCalled();
        });

        it('fails to initialize the bolt strategy and load bolt embedded script if onPaymentSelect is not provided', async () => {
            const initializationOptions = {
                methodId: 'bolt',
                bolt: {
                    ...boltEmbeddedScriptInitializationOptions.bolt,
                    onPaymentSelect: null,
                },
            };

            paymentMethodMock.initializationData!.embeddedOneClickEnabled = true;

            await expect(strategy.initialize(initializationOptions)).rejects.toThrow(
                InvalidArgumentError,
            );
            expect(boltScriptLoader.loadBoltEmbedded).not.toHaveBeenCalled();
            expect(boltClient.hasBoltAccount).not.toHaveBeenCalled();
        });

        it('fails to initialize the bolt strategy and load bolt embedded script if containerId is not provided', async () => {
            const initializationOptions = {
                methodId: 'bolt',
                bolt: {
                    containerId: undefined,
                    useBigCommerceCheckout: true,
                    onPaymentSelect: jest.fn(),
                },
            };

            paymentMethodMock.initializationData!.embeddedOneClickEnabled = true;

            await expect(strategy.initialize(initializationOptions)).rejects.toThrow(
                InvalidArgumentError,
            );
            expect(boltScriptLoader.loadBoltEmbedded).not.toHaveBeenCalled();
            expect(boltClient.hasBoltAccount).not.toHaveBeenCalled();
            expect(initializationOptions.bolt.onPaymentSelect).not.toHaveBeenCalled();
        });

        it('successfully initializes the bolt strategy, loads the bolt embedded and mounts bolt embedded field', async () => {
            paymentMethodMock.initializationData!.embeddedOneClickEnabled = true;

            await strategy.initialize(boltEmbeddedScriptInitializationOptions);

            expect(boltScriptLoader.loadBoltEmbedded).toHaveBeenCalledWith(
                'publishableKey',
                true,
                undefined,
            );
            expect(boltEmbedded.create).toHaveBeenCalled();
            expect(boltEmbeddedField.mount).toHaveBeenCalled();
            expect(boltClient.hasBoltAccount).toHaveBeenCalled();
            expect(
                boltEmbeddedScriptInitializationOptions.bolt?.onPaymentSelect,
            ).toHaveBeenCalled();
        });

        it('successfully initializes the bolt strategy, loads the bolt embedded with developer params and mounts bolt embedded field', async () => {
            paymentMethodMock.initializationData!.embeddedOneClickEnabled = true;
            paymentMethodMock.initializationData!.developerConfig = {
                developerMode: 'bolt_sandbox' as BoltDeveloperMode,
                developerDomain: '',
            };

            await strategy.initialize(boltEmbeddedScriptInitializationOptions);

            expect(boltScriptLoader.loadBoltEmbedded).toHaveBeenCalledWith(
                'publishableKey',
                true,
                paymentMethodMock.initializationData!.developerConfig,
            );
            expect(boltEmbedded.create).toHaveBeenCalled();
            expect(boltEmbeddedField.mount).toHaveBeenCalled();
            expect(boltClient.hasBoltAccount).toHaveBeenCalled();
            expect(
                boltEmbeddedScriptInitializationOptions.bolt?.onPaymentSelect,
            ).toHaveBeenCalled();
        });

        it('successfully initializes the bolt strategy without loading the bolt embedded', async () => {
            await strategy.initialize(boltTakeOverInitializationOptions);

            expect(boltScriptLoader.loadBoltClient).toHaveBeenCalled();
            expect(boltScriptLoader.loadBoltEmbedded).not.toHaveBeenCalled();
        });

        it('successfully initializes the bolt strategy without publishable key if BoltCheckout SDK was initialized before', async () => {
            await boltScriptLoader.loadBoltClient(
                'publishableKey',
                true,
                paymentMethodMock.initializationData!.developerConfig,
            );

            const initializationOptions = {
                ...boltTakeOverInitializationOptions,
                bolt: {
                    useBigCommerceCheckout: false,
                },
            };

            paymentMethodMock.initializationData.publishableKey = null;

            await strategy.initialize(initializationOptions);

            expect(boltScriptLoader.loadBoltClient).toHaveBeenCalledWith();
        });

        it('fails to initialize the bolt strategy if publishableKey is not provided when using Bigcommerce Checkout', async () => {
            paymentMethodMock.initializationData.publishableKey = null;

            await expect(
                strategy.initialize(boltClientScriptInitializationOptions),
            ).rejects.toThrow(MissingDataError);
            expect(boltScriptLoader.loadBoltClient).not.toHaveBeenCalled();
            expect(boltScriptLoader.loadBoltEmbedded).not.toHaveBeenCalled();
        });
    });

    describe('#execute', () => {
        const expectedPayment = {
            methodId: 'bolt',
            paymentData: {
                nonce: 'transactionReference',
            },
        };

        it('successfully executes the bolt strategy and submits payment when using bolt client', async () => {
            const expectedCart = {
                orderToken: 'clientToken',
            };
            const expectedCallbacks = {
                success: expect.any(Function),
                close: expect.any(Function),
            };

            await strategy.initialize(boltClientScriptInitializationOptions);
            await strategy.execute(payload);

            expect(paymentIntegrationService.applyStoreCredit).toHaveBeenCalledWith(false);
            expect(boltClient.configure).toHaveBeenCalledWith(
                expect.objectContaining(expectedCart),
                {},
                expect.objectContaining(expectedCallbacks),
            );
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(expectedPayment);
        });

        it('succesfully executes the bolt strategy and applies store credit when using bolt client', async () => {
            const expectedCart = {
                orderToken: 'clientToken',
            };
            const expectedCallbacks = {
                success: expect.any(Function),
                close: expect.any(Function),
            };

            checkoutMock.isStoreCreditApplied = true;

            await strategy.initialize(boltClientScriptInitializationOptions);
            await strategy.execute(payload);

            expect(paymentIntegrationService.applyStoreCredit).toHaveBeenCalledWith(true);
            expect(boltClient.configure).toHaveBeenCalledWith(
                expect.objectContaining(expectedCart),
                {},
                expect.objectContaining(expectedCallbacks),
            );
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(expectedPayment);
        });

        it('succesfully executes the bolt strategy with checkout takeover', async () => {
            jest.spyOn(boltClient, 'getTransactionReference').mockResolvedValue(
                'transactionReference',
            );

            await strategy.initialize(boltTakeOverInitializationOptions);
            await strategy.execute(payload);

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
            expect(boltClient.setOrderId).toHaveBeenCalled();
            expect(boltClient.getTransactionReference).toHaveBeenCalled();
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(expectedPayment);
            expect(paymentIntegrationService.applyStoreCredit).not.toHaveBeenCalled();
            expect(boltClient.configure).not.toHaveBeenCalled();
        });

        it('fails to submit payment if no transaction reference returned from bolt client with checkout takeover', async () => {
            jest.spyOn(boltClient, 'getTransactionReference').mockResolvedValue(undefined);

            await strategy.initialize(boltTakeOverInitializationOptions);

            await expect(strategy.execute(payload)).rejects.toThrow(PaymentMethodInvalidError);

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
            expect(boltClient.setOrderId).toHaveBeenCalled();
            expect(boltClient.getTransactionReference).toHaveBeenCalled();
            expect(paymentIntegrationService.submitPayment).not.toHaveBeenCalled();
            expect(paymentIntegrationService.submitPayment).not.toHaveBeenCalledWith(
                expectedPayment,
            );
            expect(paymentIntegrationService.applyStoreCredit).not.toHaveBeenCalled();
            expect(boltClient.configure).not.toHaveBeenCalled();
        });

        it('fails to execute the bolt strategy if no payment is provided when using bolt client', async () => {
            payload.payment = undefined;
            await strategy.initialize(boltClientScriptInitializationOptions);

            await expect(strategy.execute(payload)).rejects.toThrow(PaymentArgumentInvalidError);
            expect(boltClient.configure).not.toHaveBeenCalled();
            expect(paymentIntegrationService.submitPayment).not.toHaveBeenCalled();
        });

        it('fails to execute the bolt strategy if no client token is provided when using bolt client', async () => {
            paymentMethodMock.clientToken = undefined;
            await strategy.initialize(boltClientScriptInitializationOptions);

            await expect(strategy.execute(payload)).rejects.toThrow(MissingDataError);
            expect(boltClient.configure).not.toHaveBeenCalled();
            expect(paymentIntegrationService.submitPayment).not.toHaveBeenCalled();
        });

        it('fails to execute the bolt strategy if the client script is not loaded when using bolt client', async () => {
            jest.spyOn(boltScriptLoader, 'loadBoltClient').mockResolvedValue(undefined);
            await strategy.initialize(boltClientScriptInitializationOptions);

            await expect(strategy.execute(payload)).rejects.toThrow(NotInitializedError);
            expect(boltClient.configure).not.toHaveBeenCalled();
            expect(paymentIntegrationService.submitPayment).not.toHaveBeenCalled();
        });

        it('does not submit payment if the payment is cancelled when using bolt client', async () => {
            boltClient = getBoltClientScriptMock(false);
            jest.spyOn(boltScriptLoader, 'loadBoltClient').mockResolvedValue(boltClient);
            await strategy.initialize(boltClientScriptInitializationOptions);

            await expect(strategy.execute(payload)).rejects.toThrow(PaymentMethodCancelledError);
            expect(boltClient.configure).toHaveBeenCalled();
            expect(paymentIntegrationService.submitPayment).not.toHaveBeenCalled();
        });

        it('does not submit payment if the payment is cancelled because of invalid transaction reference when using bolt client', async () => {
            boltClient = getBoltClientScriptMock(true, false);
            jest.spyOn(boltScriptLoader, 'loadBoltClient').mockResolvedValue(boltClient);
            await strategy.initialize(boltClientScriptInitializationOptions);

            await expect(strategy.execute(payload)).rejects.toThrow(PaymentMethodFailedError);
            expect(boltClient.configure).toHaveBeenCalled();
            expect(paymentIntegrationService.submitPayment).not.toHaveBeenCalled();
        });

        it('fails to execute the strategy if no payment is provided with checkout takeover', async () => {
            payload.payment = undefined;

            await strategy.initialize(boltTakeOverInitializationOptions);

            await expect(strategy.execute(payload)).rejects.toThrow(PaymentArgumentInvalidError);
            expect(paymentIntegrationService.applyStoreCredit).not.toHaveBeenCalled();
            expect(boltClient.configure).not.toHaveBeenCalled();
        });

        it('fails to execute the strategy if no method id is provided with checkout takeover', async () => {
            payload.payment = {
                methodId: '',
            };

            await strategy.initialize(boltTakeOverInitializationOptions);

            await expect(strategy.execute(payload)).rejects.toThrow(MissingDataError);
            expect(paymentIntegrationService.applyStoreCredit).not.toHaveBeenCalled();
            expect(boltClient.configure).not.toHaveBeenCalled();
        });

        it('fails to execute the strategy if no payment payload sent without account creation field with bolt embedded', async () => {
            const boltEmbeddedPayload = {
                payment: {
                    methodId: 'bolt',
                    paymentData: {},
                },
            };

            paymentMethodMock.initializationData!.embeddedOneClickEnabled = true;

            await strategy.initialize(boltEmbeddedScriptInitializationOptions);

            await expect(strategy.execute(boltEmbeddedPayload)).rejects.toThrow(MissingDataError);
            expect(boltEmbeddedField.tokenize).not.toHaveBeenCalled();
            expect(paymentIntegrationService.submitOrder).not.toHaveBeenCalled();
            expect(paymentIntegrationService.submitPayment).not.toHaveBeenCalled();
        });

        it('fails to execute the strategy if no payment provided with bolt embedded', async () => {
            const boltEmbeddedPayload = {
                payment: undefined,
            };

            await strategy.initialize(boltEmbeddedScriptInitializationOptions);

            await expect(strategy.execute(boltEmbeddedPayload)).rejects.toThrow(
                PaymentArgumentInvalidError,
            );
            expect(boltEmbeddedField.tokenize).not.toHaveBeenCalled();
            expect(paymentIntegrationService.submitOrder).not.toHaveBeenCalled();
            expect(paymentIntegrationService.submitPayment).not.toHaveBeenCalled();
        });

        it('fails to execute the strategy with bolt embedded if provider will receive an error', async () => {
            const boltEmbeddedPayload = {
                payment: {
                    methodId: 'bolt',
                    paymentData: {
                        shouldCreateAccount: false,
                    },
                },
            };

            jest.spyOn(boltEmbeddedField, 'tokenize').mockImplementation(() => {
                throw new Error();
            });

            paymentMethodMock.initializationData!.embeddedOneClickEnabled = true;

            await strategy.initialize(boltEmbeddedScriptInitializationOptions);

            await expect(strategy.execute(boltEmbeddedPayload)).rejects.toThrow(Error);
            expect(boltEmbeddedField.tokenize).toHaveBeenCalled();
            expect(paymentIntegrationService.submitPayment).not.toHaveBeenCalled();
        });

        it('fails to execute the strategy with bolt embedded if provider will receive invalid data', async () => {
            const invalidData = {
                token: undefined,
                last4: 'last4',
                bin: 'bin',
                expiration: 1122,
            };

            const boltEmbeddedPayload = {
                payment: {
                    methodId: 'bolt',
                    paymentData: {
                        shouldCreateAccount: false,
                    },
                },
            };

            jest.spyOn(boltEmbeddedField, 'tokenize').mockResolvedValue(invalidData);

            paymentMethodMock.initializationData!.embeddedOneClickEnabled = true;

            await strategy.initialize(boltEmbeddedScriptInitializationOptions);

            await expect(strategy.execute(boltEmbeddedPayload)).rejects.toThrow(
                PaymentArgumentInvalidError,
            );
            expect(boltEmbeddedField.tokenize).toHaveBeenCalled();
            expect(paymentIntegrationService.submitPayment).not.toHaveBeenCalled();
        });

        it('succesfully executes the bolt strategy with bolt embedded (without account creation)', async () => {
            const submitPaymentOptions = {
                methodId: 'bolt',
                paymentData: {
                    formattedPayload: {
                        credit_card_token: {
                            token: 'token',
                            last_four_digits: '1111',
                            iin: '1111',
                            expiration_month: 11,
                            expiration_year: 2022,
                        },
                        provider_data: {
                            create_account: false,
                            embedded_checkout: true,
                        },
                    },
                },
            };
            const boltEmbeddedPayload = {
                payment: {
                    methodId: 'bolt',
                    paymentData: {
                        shouldCreateAccount: false,
                    },
                },
            };

            paymentMethodMock.initializationData!.embeddedOneClickEnabled = true;
            await strategy.initialize(boltEmbeddedScriptInitializationOptions);
            await strategy.execute(boltEmbeddedPayload);

            expect(boltEmbeddedField.tokenize).toHaveBeenCalled();
            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                submitPaymentOptions,
            );
        });

        it('succesfully executes the bolt strategy with bolt embedded (with account creation)', async () => {
            const submitPaymentOptions = {
                methodId: 'bolt',
                paymentData: {
                    formattedPayload: {
                        credit_card_token: {
                            token: 'token',
                            last_four_digits: '1111',
                            iin: '1111',
                            expiration_month: 11,
                            expiration_year: 2022,
                        },
                        provider_data: {
                            create_account: true,
                            embedded_checkout: true,
                        },
                    },
                },
            };

            const boltEmbeddedPayload = {
                payment: {
                    methodId: 'bolt',
                    paymentData: {
                        shouldCreateAccount: true,
                    },
                },
            };

            paymentMethodMock.initializationData!.embeddedOneClickEnabled = true;
            await strategy.initialize(boltEmbeddedScriptInitializationOptions);
            await strategy.execute(boltEmbeddedPayload);

            expect(boltEmbeddedField.tokenize).toHaveBeenCalled();
            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                submitPaymentOptions,
            );
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes Bolt client script strategy', async () => {
            await strategy.initialize(boltClientScriptInitializationOptions);
            await strategy.deinitialize();

            expect(boltEmbeddedField.unmount).not.toHaveBeenCalled();
        });

        it('deinitializes Bolt embedded one click strategy', async () => {
            paymentMethodMock.initializationData!.embeddedOneClickEnabled = true;
            await strategy.initialize(boltEmbeddedScriptInitializationOptions);

            await strategy.deinitialize();

            expect(boltEmbeddedField.unmount).toHaveBeenCalled();
        });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
        });
    });
});
