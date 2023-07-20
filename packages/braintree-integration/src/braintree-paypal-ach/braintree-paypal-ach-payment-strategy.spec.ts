import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    InvalidArgumentError,
    MissingDataError,
    OrderFinalizationNotRequiredError,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethod,
    PaymentMethodFailedError,
    WithBankAccountInstrument,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getCheckout,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { BraintreeBankAccount } from '../braintree';
import BraintreeIntegrationService from '../braintree-integration-service';
import BraintreeScriptLoader from '../braintree-script-loader';
import { getBankAccountMock, getBraintreeAch } from '../braintree.mock';

import { WithBraintreePaypalAchPaymentInitializeOptions } from './braintree-paypal-ach-initialize-options';
import BraintreePaypalAchPaymentStrategy from './braintree-paypal-ach-payment-strategy';

describe('BraintreePaypalAchPaymentStrategy', () => {
    let strategy: BraintreePaypalAchPaymentStrategy;
    let paymentIntegrationService: PaymentIntegrationService;

    let braintreeIntegrationService: BraintreeIntegrationService;
    let braintreeScriptLoader: BraintreeScriptLoader;
    let paymentMethodMock: PaymentMethod;

    let mockBankAccount: BraintreeBankAccount;

    const methodId = 'ach';
    const deviceSessionId = 'deviceSessionId';

    const mockOptions: PaymentInitializeOptions & WithBraintreePaypalAchPaymentInitializeOptions = {
        methodId,
        braintreeach: {
            getMandateText: () => 'text',
        },
    };

    const paymentData: WithBankAccountInstrument = {
        accountNumber: '0000000004',
        routingNumber: '000000001',
        ownershipType: 'Personal',
        accountType: 'Checking',
        firstName: 'Test',
        lastName: 'Tester',
        businessName: 'Company',
        shouldSaveInstrument: true,
        shouldSetAsDefaultInstrument: true,
        instrumentId: '',
    };

    const vaultingPaymentData = {
        instrumentId: 'ads123asd123',
        shouldSetAsDefaultInstrument: true,
    };

    const vaultingToConfirmPaymentData = {
        ...paymentData,
        instrumentId: 'ads123asd123',
    };

    const invalidOrderRequestBody = {
        payment: {
            methodId,
            paymentData: {},
        },
    };

    const orderRequestBody = {
        payment: {
            methodId,
            paymentData,
        },
    };

    const orderRequestBodyWithVaultingInstrument = {
        payment: {
            methodId,
            paymentData: vaultingPaymentData,
        },
    };

    const orderRequestBodyWithUntrustedVaultingInstrument = {
        payment: {
            methodId,
            paymentData: vaultingToConfirmPaymentData,
        },
    };

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        mockBankAccount = getBankAccountMock();

        braintreeScriptLoader = new BraintreeScriptLoader(getScriptLoader(), window);
        braintreeIntegrationService = new BraintreeIntegrationService(
            braintreeScriptLoader,
            window,
        );

        paymentMethodMock = {
            ...getBraintreeAch(),
            clientToken: 'token',
        };

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethodMock,
        );

        jest.spyOn(paymentIntegrationService.getState(), 'getCheckoutOrThrow').mockReturnValue(
            getCheckout(),
        );

        jest.spyOn(braintreeIntegrationService, 'initialize').mockImplementation(jest.fn);

        jest.spyOn(braintreeIntegrationService, 'getClient').mockReturnValue(
            paymentMethodMock.clientToken,
        );

        jest.spyOn(braintreeIntegrationService, 'getSessionId').mockReturnValue(deviceSessionId);

        jest.spyOn(braintreeIntegrationService, 'getUsBankAccount').mockReturnValue(
            mockBankAccount,
        );

        strategy = new BraintreePaypalAchPaymentStrategy(
            paymentIntegrationService,
            braintreeIntegrationService,
        );
    });

    it('instantiates braintree paypal ach payment strategy', () => {
        expect(strategy).toBeInstanceOf(BraintreePaypalAchPaymentStrategy);
    });

    describe('#initialize', () => {
        it('throws an error if methodId is not provided', async () => {
            const options = {} as PaymentInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws error if client token is missing', async () => {
            paymentMethodMock.clientToken = undefined;

            try {
                await strategy.initialize(mockOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('throws error if initialization data is missing', async () => {
            paymentMethodMock.initializationData = undefined;

            try {
                await strategy.initialize(mockOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('successfully initialization payment strategy', async () => {
            await strategy.initialize(mockOptions);

            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith(methodId);
            expect(braintreeIntegrationService.initialize).toHaveBeenCalledWith(
                paymentMethodMock.clientToken,
                paymentMethodMock.initializationData,
            );
            expect(braintreeIntegrationService.getUsBankAccount).toHaveBeenCalled();
        });

        it('throws an error if something was wrong during initialization process', async () => {
            jest.spyOn(braintreeIntegrationService, 'getUsBankAccount').mockImplementation(() => {
                throw Error('error');
            });

            try {
                await strategy.initialize(mockOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodFailedError);
            }
        });
    });

    describe('#execute', () => {
        it('throws an error if payment object is not provided', async () => {
            try {
                await strategy.initialize(mockOptions);
                await strategy.execute({});
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentArgumentInvalidError);
            }
        });

        it('successfully executes payment with fulfilled account data', async () => {
            const requestBody = {
                payment: {
                    methodId,
                    paymentData,
                },
            };

            await strategy.initialize(mockOptions);
            await strategy.execute(requestBody);

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalled();
        });
    });

    describe('#tokenizePayment', () => {
        it('throws an error if valid bank account is not provided', async () => {
            try {
                await strategy.initialize(mockOptions);
                await strategy.execute(invalidOrderRequestBody);
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentArgumentInvalidError);
            }
        });

        it('throws an error if mandate text is not valid', async () => {
            const initializeOptions = {
                methodId,
                braintreeach: {
                    getMandateText: () => '',
                },
            };

            try {
                await strategy.initialize(initializeOptions);
                await strategy.execute(orderRequestBody);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if usBankAccount tokenization process was failed', async () => {
            jest.spyOn(braintreeIntegrationService, 'getUsBankAccount').mockReturnValue({
                ...getBankAccountMock(),
                tokenize: () => {
                    throw Error('error');
                },
            });

            try {
                await strategy.initialize(mockOptions);
                await strategy.execute(orderRequestBody);
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodFailedError);
            }
        });

        it('successfully tokenizes payment data', async () => {
            await strategy.initialize(mockOptions);
            await strategy.execute(orderRequestBody);

            expect(mockBankAccount.tokenize).toHaveBeenCalled();
        });
    });

    describe('#tokenizePaymentForVaultedInstrument', () => {
        it('throws an error if vaulting instrument is provided when ach vaulting is disabled', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue({
                ...paymentMethodMock,
                config: {
                    ...paymentMethodMock.config,
                    isVaultingEnabled: false,
                },
            });

            try {
                await strategy.initialize(mockOptions);
                await strategy.execute(orderRequestBodyWithVaultingInstrument);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('does not tokenize payment data for vaulted instrument with trusted shipping address', async () => {
            await strategy.initialize(mockOptions);
            await strategy.execute(orderRequestBodyWithVaultingInstrument);

            expect(mockBankAccount.tokenize).not.toHaveBeenCalled();
        });

        it('tokenizes payment data if the vaulted instrument needs to be confirmed', async () => {
            await strategy.initialize(mockOptions);
            await strategy.execute(orderRequestBodyWithUntrustedVaultingInstrument);

            expect(mockBankAccount.tokenize).toHaveBeenCalledWith(
                expect.objectContaining({
                    mandateText: 'The data are used for stored instrument verification',
                }),
            );
        });
    });

    describe('#preparePaymentData', () => {
        it('submits payment with prepared payment data', async () => {
            const { payment } = orderRequestBody;
            const {
                accountNumber,
                routingNumber,
                shouldSaveInstrument,
                shouldSetAsDefaultInstrument,
            } = payment.paymentData;

            const submitPaymentPayload = {
                methodId,
                paymentData: {
                    formattedPayload: {
                        vault_payment_instrument: shouldSaveInstrument,
                        set_as_default_stored_instrument: shouldSetAsDefaultInstrument,
                        device_info: deviceSessionId,
                        tokenized_bank_account: {
                            issuer: routingNumber,
                            masked_account_number: accountNumber.substr(-4),
                            token: 'NONCE',
                        },
                    },
                },
            };

            await strategy.initialize(mockOptions);
            await strategy.execute(orderRequestBody);

            expect(braintreeIntegrationService.getSessionId).toHaveBeenCalled();
            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                submitPaymentPayload,
            );
        });
    });

    describe('#preparePaymentDataForVaultedInstrument', () => {
        it('submits payment with prepared trusted vaulted payment data', async () => {
            const { payment } = orderRequestBodyWithVaultingInstrument;

            const submitPaymentPayload = {
                methodId,
                paymentData: {
                    deviceSessionId,
                    instrumentId: payment.paymentData.instrumentId,
                    shouldSetAsDefaultInstrument: payment.paymentData.shouldSetAsDefaultInstrument,
                },
            };

            await strategy.initialize(mockOptions);
            await strategy.execute(orderRequestBodyWithVaultingInstrument);

            expect(braintreeIntegrationService.getSessionId).toHaveBeenCalled();
            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                submitPaymentPayload,
            );
        });

        it('submits payment with prepared confirmed vaulted payment data', async () => {
            const { payment } = orderRequestBodyWithUntrustedVaultingInstrument;

            const submitPaymentPayload = {
                methodId,
                paymentData: {
                    deviceSessionId,
                    instrumentId: payment.paymentData.instrumentId,
                    shouldSetAsDefaultInstrument: payment.paymentData.shouldSetAsDefaultInstrument,
                    nonce: 'NONCE',
                },
            };

            await strategy.initialize(mockOptions);
            await strategy.execute(orderRequestBodyWithUntrustedVaultingInstrument);

            expect(braintreeIntegrationService.getSessionId).toHaveBeenCalled();
            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                submitPaymentPayload,
            );
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes strategy', async () => {
            await expect(strategy.deinitialize()).resolves.not.toThrow();
        });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
        });
    });
});
