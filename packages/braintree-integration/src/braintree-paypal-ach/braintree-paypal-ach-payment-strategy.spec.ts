import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    InvalidArgumentError,
    MissingDataError,
    NotInitializedError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethod,
    UsBankAccountInstrument,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { BraintreeUsBankAccount } from '../braintree';
import BraintreeIntegrationService from '../braintree-integration-service';
import BraintreeScriptLoader from '../braintree-script-loader';
import { getBankAccountMock, getBraintreeAch } from '../braintree.mock';

import { WithBraintreePaypalAchInitializeOptions } from './braintree-paypal-ach-initialize-options';
import BraintreePaypalAchPaymentStrategy from './braintree-paypal-ach-payment-strategy';

const mockOptions: PaymentInitializeOptions & WithBraintreePaypalAchInitializeOptions = {
    methodId: 'ach',
    braintreeach: {
        mandateText: 'text',
    },
};

const paymentData: UsBankAccountInstrument = {
    accountNumber: '01',
    routingNumber: '02',
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
};

const payment: OrderRequestBody = {
    payment: {
        methodId: 'ach',
        paymentData,
    },
};

describe('BraintreePaypalAchPaymentStrategy', () => {
    let strategy: BraintreePaypalAchPaymentStrategy;
    let paymentIntegrationService: PaymentIntegrationService;

    let braintreeIntegrationService: BraintreeIntegrationService;
    let braintreeScriptLoader: BraintreeScriptLoader;
    let paymentMethodMock: PaymentMethod;

    let mockBankAccount: BraintreeUsBankAccount;

    beforeEach(() => {
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

        jest.spyOn(paymentIntegrationService.getState(), 'getCustomerOrThrow').mockReturnValue(
            { email: '' },
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
            const options = { methodId: 'braintreeach' } as PaymentInitializeOptions;

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

        it('throws an error if braintreeach.mandateText is not provided', async () => {
            const options = {
                methodId: 'ach',
                braintreeach: {},
            } as PaymentInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });
    });

    describe('#execute', () => {
        it('execution was successfully', async () => {
            await strategy.initialize(mockOptions);

            const expectedResults = await strategy.execute(payment, { methodId: 'ach' });

            expect(expectedResults).toBeUndefined();
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
                await strategy.execute(payment, { methodId: 'ach' });
            } catch (error) {
                expect(error).toBeInstanceOf(NotInitializedError);
            }
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes strategy', async () => {
            await expect(strategy.deinitialize()).resolves.not.toThrow();
        });
    });
});
