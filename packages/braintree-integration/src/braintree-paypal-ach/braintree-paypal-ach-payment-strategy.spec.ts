import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    InvalidArgumentError,
    MissingDataError,
    OrderRequestBody,
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

const mockOptions: PaymentInitializeOptions & WithBraintreePaypalAchPaymentInitializeOptions = {
    methodId: 'ach',
    braintreeach: {
        getMandateText: () => 'text',
    },
};

describe('BraintreePaypalAchPaymentStrategy', () => {
    let strategy: BraintreePaypalAchPaymentStrategy;
    let paymentIntegrationService: PaymentIntegrationService;

    let braintreeIntegrationService: BraintreeIntegrationService;
    let braintreeScriptLoader: BraintreeScriptLoader;
    let paymentMethodMock: PaymentMethod;

    let mockBankAccount: BraintreeBankAccount;
    let requestBody: OrderRequestBody;

    beforeEach(() => {
        const paymentData: WithBankAccountInstrument = {
            accountNumber: '0000000004',
            routingNumber: '000000001',
            ownershipType: 'Personal',
            accountType: 'Checking',
            firstName: 'Test',
            lastName: 'Tester',
            businessName: 'Company',
            address1: 'a1',
            address2: 'a2',
            city: 'Some City',
            countryCode: '012',
            postalCode: '0123',
            stateOrProvinceCode: 'CA',
            shouldSaveInstrument: false,
            shouldSetAsDefaultInstrument: false,
            instrumentId: '',
        };

        requestBody = {
            payment: {
                methodId: 'ach',
                paymentData,
            },
        };

        paymentIntegrationService = <PaymentIntegrationService>new PaymentIntegrationServiceMock();
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

        jest.spyOn(braintreeIntegrationService, 'getClient').mockReturnValue(
            paymentMethodMock.clientToken,
        );

        jest.spyOn(braintreeIntegrationService, 'getSessionId').mockReturnValue(
            paymentMethodMock.clientToken,
        );

        jest.spyOn(paymentIntegrationService.getState(), 'getCheckoutOrThrow').mockReturnValue(
            getCheckout(),
        );

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
        it('initialization was successfully', async () => {
            const result = await strategy.initialize(mockOptions);

            expect(result).toBeUndefined();
        });

        it('throws an error if braintreeach is not provided', async () => {
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
    });

    describe('#execute', () => {
        it('execution with the Guest Flow was successful', async () => {
            try {
                await strategy.initialize(mockOptions);
                await strategy.execute(requestBody, { methodId: 'ach' });

                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                    methodId: 'ach',
                    paymentData: {
                        formattedPayload: {
                            vault_payment_instrument: null,
                            set_as_default_stored_instrument: null,
                            device_info: 'token',
                            tokenized_bank_account: {
                                issuer: '000000001',
                                masked_account_number: '0004',
                                token: 'NONCE',
                            },
                        },
                    },
                });
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('execution with the Vaulting Flow was successful', async () => {
            (requestBody.payment?.paymentData as WithBankAccountInstrument).instrumentId =
                'bigpayToken';
            (
                requestBody.payment?.paymentData as WithBankAccountInstrument
            ).shouldSetAsDefaultInstrument = true;

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue({
                ...paymentMethodMock,
                config: {
                    ...paymentMethodMock.config,
                    isVaultingEnabled: true,
                },
            });

            try {
                await strategy.initialize(mockOptions);

                const expectedResults = await strategy.execute(requestBody, { methodId: 'ach' });

                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                    expect.objectContaining({
                        methodId: 'ach',
                        paymentData: {
                            instrumentId: 'bigpayToken',
                            shouldSetAsDefaultInstrument: true,
                        },
                    }),
                );
                expect(expectedResults).toBeUndefined();
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if the Vaulting Flow executions with turned off the isVaultingEnabled', async () => {
            (requestBody.payment?.paymentData as WithBankAccountInstrument).instrumentId =
                'bigpayToken';

            try {
                await strategy.initialize(mockOptions);
                await strategy.execute(requestBody, { methodId: 'ach' });
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodFailedError);
            }
        });

        it('throws an error if braintreeach.getMandateText is not provided or returned undefined value', async () => {
            const options = {
                methodId: 'ach',
                braintreeach: {},
            } as PaymentInitializeOptions;

            try {
                await strategy.initialize(options);
                await strategy.execute({}, { methodId: 'ach' });
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if payment is not provided', async () => {
            await strategy.initialize(mockOptions);

            try {
                await strategy.execute({}, { methodId: 'ach' });
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentArgumentInvalidError);
            }
        });

        it('throws an error if usBankAccountInstance has not been created', async () => {
            try {
                await strategy.execute(requestBody, { methodId: 'ach' });
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodFailedError);
            }
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes strategy', async () => {
            await expect(strategy.deinitialize()).resolves.not.toThrow();
        });
    });
});
