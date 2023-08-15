import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    InvalidArgumentError,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';
import { BrowserStorage } from '@bigcommerce/checkout-sdk/storage';

import BraintreeIntegrationService from '../braintree-integration-service';
import BraintreeScriptLoader from '../braintree-script-loader';
import { getBraintree } from '../mocks/braintree.mock';

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
    const backuptMethodId = 'braintree';

    const initializationOptions = { methodId };
    const executionOptions = {
        methodId,
        continueWithCheckoutCallback: jest.fn(),
    };
    const paymentMethod = {
        ...getBraintree(),
        methodId,
        initializationData: {
            isAcceleratedCheckoutEnabled: true,
            shouldRunAcceleratedCheckout: true,
        },
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
        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );
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
        it('initializes strategy', async () => {
            await expect(strategy.initialize(initializationOptions)).resolves.not.toThrow();
        });
    });

    describe('#executePaymentMethodCheckout()', () => {
        it('throws an error if continueWithCheckoutCallback is not provided or it is not a function', async () => {
            try {
                await strategy.initialize({ methodId });
                await strategy.executePaymentMethodCheckout();
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('authenticates user with PayPal Connect and calls continueWithCheckoutCallback', async () => {
            await strategy.initialize({ methodId });
            await strategy.executePaymentMethodCheckout(executionOptions);

            expect(
                braintreeAcceleratedCheckoutUtils.runPayPalConnectAuthenticationFlowOrThrow,
            ).toHaveBeenCalled();
            expect(executionOptions.continueWithCheckoutCallback).toHaveBeenCalled();
        });

        // INFO: PayPal Connect authentication tests can be found in
        // describe #shouldRunAuthenticationFlow() & #runPayPalConnectAuthenticationFlowOrThrow()
    });

    describe('#signIn()', () => {
        it('calls default sign in method', async () => {
            const credentials = {
                email: 'test@test.com',
                password: '123',
            };

            await strategy.initialize({ methodId });
            await strategy.signIn(credentials);

            expect(paymentIntegrationService.signInCustomer).toHaveBeenCalledWith(
                credentials,
                undefined,
            );
        });

        // INFO: PayPal Connect authentication tests can be found in
        // describe #shouldRunAuthenticationFlow() & #runPayPalConnectAuthenticationFlowOrThrow()
    });

    describe('#shouldRunAuthenticationFlow() & #runPayPalConnectAuthenticationFlowOrThrow()', () => {
        it('authenticates customer with PayPal Connect', async () => {
            await strategy.initialize({ methodId });
            await strategy.executePaymentMethodCheckout(executionOptions);

            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith(methodId);
            expect(
                braintreeAcceleratedCheckoutUtils.initializeBraintreeConnectOrThrow,
            ).toHaveBeenCalledWith(methodId);
            expect(
                braintreeAcceleratedCheckoutUtils.runPayPalConnectAuthenticationFlowOrThrow,
            ).toHaveBeenCalled();
        });

        it('does not authenticate customer with PayPal Connect if it should not run', async () => {
            const mockPaymentMethod = {
                ...paymentMethod,
                initializationData: {
                    isAcceleratedCheckoutEnabled: true,
                    shouldRunAcceleratedCheckout: false,
                },
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(mockPaymentMethod);

            await strategy.initialize({ methodId });
            await strategy.executePaymentMethodCheckout(executionOptions);

            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith(methodId);
            expect(
                braintreeAcceleratedCheckoutUtils.initializeBraintreeConnectOrThrow,
            ).not.toHaveBeenCalled();
            expect(
                braintreeAcceleratedCheckoutUtils.runPayPalConnectAuthenticationFlowOrThrow,
            ).not.toHaveBeenCalled();
        });

        it('does not authenticate customer with PayPal Connect if Accelerated checkout is disabled', async () => {
            const mockPaymentMethod = {
                ...paymentMethod,
                initializationData: {
                    isAcceleratedCheckoutEnabled: false,
                    shouldRunAcceleratedCheckout: false,
                },
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(mockPaymentMethod);

            await strategy.initialize({ methodId });
            await strategy.executePaymentMethodCheckout(executionOptions);

            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith(methodId);
            expect(
                braintreeAcceleratedCheckoutUtils.initializeBraintreeConnectOrThrow,
            ).not.toHaveBeenCalled();
            expect(
                braintreeAcceleratedCheckoutUtils.runPayPalConnectAuthenticationFlowOrThrow,
            ).not.toHaveBeenCalled();
        });

        it('authenticates customer with PayPal Connect by provided email after sign in', async () => {
            const credentials = {
                email: 'test@test.com',
                password: '123',
            };

            await strategy.initialize({ methodId });
            await strategy.signIn(credentials);

            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith(methodId);
            expect(
                braintreeAcceleratedCheckoutUtils.initializeBraintreeConnectOrThrow,
            ).toHaveBeenCalledWith(methodId);
            expect(
                braintreeAcceleratedCheckoutUtils.runPayPalConnectAuthenticationFlowOrThrow,
            ).toHaveBeenCalledWith(credentials.email);
        });

        it('loads different payment method due to the A/B testing flow', async () => {
            jest.spyOn(paymentIntegrationService, 'loadPaymentMethod').mockRejectedValueOnce(
                new Error(),
            );

            const credentials = {
                email: 'test@test.com',
                password: '123',
            };

            await strategy.initialize({ methodId });
            await strategy.signIn(credentials);

            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith(methodId);
            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith(
                backuptMethodId,
            );
            expect(
                braintreeAcceleratedCheckoutUtils.initializeBraintreeConnectOrThrow,
            ).toHaveBeenCalledWith(methodId);
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

    describe('#deinitialize()', () => {
        it('deinitializes strategy', async () => {
            await expect(strategy.deinitialize()).resolves.not.toThrow();
        });
    });
});
