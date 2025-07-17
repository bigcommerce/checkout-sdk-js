import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    BraintreeDataCollector,
    BraintreeScriptLoader,
    BraintreeSdk,
    BraintreeSDKVersionManager,
    BraintreeUsBankAccount,
    getDataCollectorMock,
    getUsBankAccountMock,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    InvalidArgumentError,
    MissingDataError,
    NotInitializedError,
    OrderFinalizationNotRequiredError,
    PaymentArgumentInvalidError,
    PaymentIntegrationService,
    PaymentMethodFailedError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { getBraintreeAchPaymentMethod } from './braintree-ach-payment-method.mock';
import BraintreeAchPaymentStrategy from './braintree-ach-payment-strategy';

describe('BraintreeAchPaymentStrategy', () => {
    let braintreeScriptLoader: BraintreeScriptLoader;
    let braintreeSdk: BraintreeSdk;
    let braintreeUsBankAccount: BraintreeUsBankAccount;
    let braintreeDataCollector: BraintreeDataCollector;
    let paymentIntegrationService: PaymentIntegrationService;
    let strategy: BraintreeAchPaymentStrategy;
    let braintreeSDKVersionManager: BraintreeSDKVersionManager;

    const methodId = 'braintreeach';
    const paymentMethodMock = getBraintreeAchPaymentMethod();

    const braintreeAchInitializationOptions = {
        methodId,
        braintreeach: {
            getMandateText: () => 'text',
        },
    };

    beforeEach(() => {
        braintreeUsBankAccount = getUsBankAccountMock();
        braintreeDataCollector = getDataCollectorMock();

        braintreeSDKVersionManager = new BraintreeSDKVersionManager(paymentIntegrationService);
        braintreeScriptLoader = new BraintreeScriptLoader(
            getScriptLoader(),
            window,
            braintreeSDKVersionManager,
        );
        braintreeSdk = new BraintreeSdk(braintreeScriptLoader);
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        strategy = new BraintreeAchPaymentStrategy(paymentIntegrationService, braintreeSdk);

        const state = paymentIntegrationService.getState();

        jest.spyOn(paymentIntegrationService, 'loadPaymentMethod').mockImplementation(jest.fn());
        jest.spyOn(state, 'getPaymentMethodOrThrow').mockImplementation(() => paymentMethodMock);
        jest.spyOn(paymentIntegrationService, 'submitOrder');
        jest.spyOn(paymentIntegrationService, 'submitPayment');

        jest.spyOn(braintreeSdk, 'initialize');
        jest.spyOn(braintreeSdk, 'deinitialize');
        jest.spyOn(braintreeSdk, 'getDataCollectorOrThrow').mockResolvedValue(
            braintreeDataCollector,
        );
        jest.spyOn(braintreeSdk, 'getUsBankAccount').mockResolvedValue(braintreeUsBankAccount);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('#initialize', () => {
        it('throws an error if methodId is not provided', async () => {
            try {
                await strategy.initialize({ methodId: '' });
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if clientToken is not defined', async () => {
            const newPaymentMethodMock = { ...paymentMethodMock, clientToken: undefined };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockImplementation(() => newPaymentMethodMock);

            try {
                await strategy.initialize({ methodId });
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('throws an error if initializationData is not defined', async () => {
            const newPaymentMethodMock = { ...paymentMethodMock, initializationData: undefined };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockImplementation(() => newPaymentMethodMock);

            try {
                await strategy.initialize({ methodId });
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('successfully initializes braintree sdk and braintree us bank account', async () => {
            await strategy.initialize({ methodId });

            expect(braintreeSdk.initialize).toHaveBeenCalledWith(paymentMethodMock.clientToken);
            expect(braintreeSdk.getUsBankAccount).toHaveBeenCalled();
        });

        it('throws an error if there was an issue with getting braintree us bank account module', async () => {
            jest.spyOn(braintreeSdk, 'getUsBankAccount').mockImplementation(() => {
                throw new Error();
            });

            try {
                await strategy.initialize({ methodId });
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodFailedError);
            }
        });
    });

    describe('#execute', () => {
        it('throws an error if payment is not provided', async () => {
            try {
                await strategy.execute({});
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentArgumentInvalidError);
            }
        });

        it('throws an error if braintree sdk is not initialized', async () => {
            try {
                await strategy.execute({
                    payment: {
                        methodId,
                        paymentData: {},
                    },
                });
            } catch (error) {
                expect(error).toBeInstanceOf(NotInitializedError);
            }
        });

        it('throws an error if stored instrument is not related to us bank account', async () => {
            try {
                await strategy.initialize({ methodId });
                await strategy.execute({
                    payment: {
                        methodId,
                        paymentData: {},
                    },
                });
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentArgumentInvalidError);
            }
        });

        it('throws an error if getMandateText is not provided or mandateText is empty', async () => {
            try {
                await strategy.initialize({ methodId });
                await strategy.execute({
                    payment: {
                        methodId,
                        paymentData: {
                            accountNumber: '10000000',
                            routingNumber: '111111111',
                            ownershipType: 'Personal',
                            accountType: 'Checking',
                        },
                    },
                });
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error for not-braintree exception', async () => {
            const ExternalError = {
                name: 'ExternalError',
            };

            jest.spyOn(braintreeUsBankAccount, 'tokenize').mockImplementation(() => {
                throw ExternalError;
            });

            try {
                await strategy.initialize(braintreeAchInitializationOptions);
                await strategy.execute({
                    payment: {
                        methodId,
                        paymentData: {
                            accountNumber: '10000000',
                            routingNumber: '111111111',
                            ownershipType: 'Personal',
                            accountType: 'Checking',
                        },
                    },
                });
            } catch (error: any) {
                expect(ExternalError.name).toBe('ExternalError');
            }
        });

        it('submits payment with braintree ach', async () => {
            await strategy.initialize(braintreeAchInitializationOptions);
            await strategy.execute({
                payment: {
                    methodId,
                    paymentData: {
                        firstName: 'John',
                        lastName: 'Doe',
                        accountNumber: '10000000',
                        routingNumber: '111111111',
                        ownershipType: 'Personal',
                        accountType: 'Checking',
                    },
                },
            });

            expect(braintreeUsBankAccount.tokenize).toHaveBeenCalledWith({
                bankDetails: {
                    accountNumber: '10000000',
                    accountType: 'checking',
                    billingAddress: {
                        extendedAddress: '',
                        locality: 'Some City',
                        postalCode: '95555',
                        region: 'CA',
                        streetAddress: '12345 Testing Way',
                    },
                    firstName: 'John',
                    lastName: 'Doe',
                    ownershipType: 'personal',
                    routingNumber: '111111111',
                },
                mandateText: 'text',
            });

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith({}, undefined);
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId,
                paymentData: {
                    deviceSessionId: braintreeDataCollector.deviceData,
                    formattedPayload: {
                        tokenized_bank_account: {
                            issuer: '111111111',
                            masked_account_number: '0000',
                            token: 'token',
                        },
                    },
                    shouldSaveInstrument: undefined,
                    shouldSetAsDefaultInstrument: undefined,
                },
            });
        });

        it('submits payment with braintree ach for business', async () => {
            await strategy.initialize(braintreeAchInitializationOptions);
            await strategy.execute({
                payment: {
                    methodId,
                    paymentData: {
                        businessName: 'BigCommerce',
                        accountNumber: '10000000',
                        routingNumber: '111111111',
                        ownershipType: 'Business',
                        accountType: 'Checking',
                    },
                },
            });

            expect(braintreeUsBankAccount.tokenize).toHaveBeenCalledWith({
                bankDetails: {
                    accountNumber: '10000000',
                    accountType: 'checking',
                    billingAddress: {
                        extendedAddress: '',
                        locality: 'Some City',
                        postalCode: '95555',
                        region: 'CA',
                        streetAddress: '12345 Testing Way',
                    },
                    businessName: 'BigCommerce',
                    ownershipType: 'business',
                    routingNumber: '111111111',
                },
                mandateText: 'text',
            });

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith({}, undefined);
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId,
                paymentData: {
                    deviceSessionId: braintreeDataCollector.deviceData,
                    formattedPayload: {
                        tokenized_bank_account: {
                            issuer: '111111111',
                            masked_account_number: '0000',
                            token: 'token',
                        },
                    },
                    shouldSaveInstrument: undefined,
                    shouldSetAsDefaultInstrument: undefined,
                },
            });
        });

        it('submits payment with braintree ach vaulted instrument with verification', async () => {
            await strategy.initialize(braintreeAchInitializationOptions);
            await strategy.execute({
                payment: {
                    methodId,
                    paymentData: {
                        instrumentId: 'AchInstrumentId',
                        businessName: 'BigCommerce',
                        accountNumber: '10000000',
                        routingNumber: '111111111',
                        ownershipType: 'Business',
                        accountType: 'Checking',
                    },
                },
            });

            expect(braintreeUsBankAccount.tokenize).toHaveBeenCalledWith({
                bankDetails: {
                    accountNumber: '10000000',
                    accountType: 'checking',
                    billingAddress: {
                        extendedAddress: '',
                        locality: 'Some City',
                        postalCode: '95555',
                        region: 'CA',
                        streetAddress: '12345 Testing Way',
                    },
                    businessName: 'BigCommerce',
                    ownershipType: 'business',
                    routingNumber: '111111111',
                },
                mandateText: 'The data are used for stored instrument verification',
            });

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith({}, undefined);
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId,
                paymentData: {
                    deviceSessionId: braintreeDataCollector.deviceData,
                    instrumentId: 'AchInstrumentId',
                    nonce: 'token',
                    shouldSaveInstrument: undefined,
                    shouldSetAsDefaultInstrument: undefined,
                },
            });
        });

        it('throw an error if vaulting is disabled', async () => {
            const state = paymentIntegrationService.getState();

            jest.spyOn(state, 'getPaymentMethodOrThrow').mockImplementation(() => ({
                ...paymentMethodMock,
                config: {
                    ...paymentMethodMock.config,
                    isVaultingEnabled: false,
                },
            }));

            await strategy.initialize(braintreeAchInitializationOptions);

            await expect(
                strategy.execute({
                    payment: {
                        methodId,
                        paymentData: {
                            instrumentId: 'AchInstrumentId',
                            businessName: 'BigCommerce',
                            accountNumber: '10000000',
                            routingNumber: '111111111',
                            ownershipType: 'Business',
                            accountType: 'Checking',
                        },
                    },
                }),
            ).rejects.toThrow(InvalidArgumentError);
        });
    });

    describe('#deinitialize', () => {
        it('deinitializes braintree sdk', async () => {
            await strategy.deinitialize();

            expect(braintreeSdk.deinitialize).toHaveBeenCalled();
        });
    });

    describe('#finalize', () => {
        it('throw an error by default', async () => {
            try {
                await strategy.finalize();
            } catch (error) {
                expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
            }
        });
    });
});
