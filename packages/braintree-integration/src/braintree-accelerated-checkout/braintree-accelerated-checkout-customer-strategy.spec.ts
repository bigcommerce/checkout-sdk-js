import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    CustomerInitializeOptions,
    InvalidArgumentError,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';
import { BrowserStorage } from '@bigcommerce/checkout-sdk/storage';

import BraintreeIntegrationService from '../braintree-integration-service';
import BraintreeScriptLoader from '../braintree-script-loader';

import BraintreeAcceleratedCheckoutCustomerStrategy from './braintree-accelerated-checkout-customer-strategy';
import BraintreeAcceleratedCheckoutUtils from './braintree-accelerated-checkout-utils';

describe('BraintreeAcceleratedCheckoutCustomerStrategy', () => {
    let braintreeAcceleratedCheckoutUtils: BraintreeAcceleratedCheckoutUtils;
    let braintreeIntegrationService: BraintreeIntegrationService;
    let braintreeScriptLoader: BraintreeScriptLoader;
    let browserStorage: BrowserStorage;
    let paymentIntegrationService: PaymentIntegrationService;
    let strategy: BraintreeAcceleratedCheckoutCustomerStrategy;

    const methodId = 'braintreeacceleratedcheckout';

    const initializationOptions = { methodId };
    const executionOptions = {
        methodId,
        continueWithCheckoutCallback: jest.fn(),
    };

    beforeEach(() => {
        browserStorage = new BrowserStorage('braintree-accelerated-checkout-mock');
        braintreeScriptLoader = new BraintreeScriptLoader(getScriptLoader(), window);
        braintreeIntegrationService = new BraintreeIntegrationService(
            braintreeScriptLoader,
            window,
        );
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        braintreeAcceleratedCheckoutUtils = new BraintreeAcceleratedCheckoutUtils(
            paymentIntegrationService,
            braintreeIntegrationService,
            browserStorage,
        );

        strategy = new BraintreeAcceleratedCheckoutCustomerStrategy(
            paymentIntegrationService,
            braintreeAcceleratedCheckoutUtils,
        );

        jest.spyOn(paymentIntegrationService, 'loadPaymentMethod');
        jest.spyOn(
            braintreeAcceleratedCheckoutUtils,
            'initializeBraintreeConnectOrThrow',
        ).mockImplementation(jest.fn);
        jest.spyOn(
            braintreeAcceleratedCheckoutUtils,
            'runPayPalConnectAuthenticationFlowOrThrow',
        ).mockImplementation(jest.fn);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('#initialize()', () => {
        it('throws an error if methodId is not provided', async () => {
            try {
                await strategy.initialize({} as CustomerInitializeOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('initializes braintree connect', async () => {
            await strategy.initialize(initializationOptions);

            expect(
                braintreeAcceleratedCheckoutUtils.initializeBraintreeConnectOrThrow,
            ).toHaveBeenCalledWith(methodId);
        });
    });

    describe('#executePaymentMethodCheckout()', () => {
        it('throws an error if continueWithCheckoutCallback is not provided or it is not a function', async () => {
            await strategy.initialize(initializationOptions);

            try {
                await strategy.executePaymentMethodCheckout({ methodId });
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('authenticates user with PayPal Connect and calls continueWithCheckoutCallback', async () => {
            await strategy.initialize(initializationOptions);
            await strategy.executePaymentMethodCheckout(executionOptions);

            expect(
                braintreeAcceleratedCheckoutUtils.runPayPalConnectAuthenticationFlowOrThrow,
            ).toHaveBeenCalled();
            expect(executionOptions.continueWithCheckoutCallback).toHaveBeenCalled();
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes strategy', async () => {
            await expect(strategy.deinitialize()).resolves.not.toThrow();
        });
    });

    describe('#signIn()', () => {
        it('calls default sign in method', async () => {
            const credentials = {
                email: 'test@test.com',
                password: '123',
            };

            await strategy.initialize(initializationOptions);
            await strategy.signIn(credentials);

            expect(paymentIntegrationService.signInCustomer).toHaveBeenCalledWith(
                credentials,
                undefined,
            );
        });

        it('authenticates the user with PayPal Connect after sign in', async () => {
            const credentials = {
                email: 'test@test.com',
                password: '123',
            };

            await strategy.initialize(initializationOptions);
            await strategy.signIn(credentials);

            expect(
                braintreeAcceleratedCheckoutUtils.runPayPalConnectAuthenticationFlowOrThrow,
            ).toHaveBeenCalledWith(credentials.email);
        });
    });

    describe('#signOut()', () => {
        it('calls default sign out method', async () => {
            await strategy.signOut();

            expect(paymentIntegrationService.signOutCustomer).toHaveBeenCalled();
        });
    });
});
