import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    BraintreeIntegrationService,
    BraintreeScriptLoader,
    getBraintree,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    InvalidArgumentError,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';
import { BrowserStorage } from '@bigcommerce/checkout-sdk/storage';

import BraintreeFastlaneCustomerStrategy from './braintree-fastlane-customer-strategy';
import BraintreeFastlaneUtils from './braintree-fastlane-utils';

describe('BraintreeFastlaneCustomerStrategy', () => {
    let braintreeFastlaneUtils: BraintreeFastlaneUtils;
    let braintreeIntegrationService: BraintreeIntegrationService;
    let braintreeScriptLoader: BraintreeScriptLoader;
    let browserStorage: BrowserStorage;
    let paymentIntegrationService: PaymentIntegrationService;
    let strategy: BraintreeFastlaneCustomerStrategy;

    const methodId = 'braintreeacceleratedcheckout';
    const initializationOptions = { methodId };
    const executionOptions = {
        methodId,
        checkoutPaymentMethodExecuted: jest.fn(),
        continueWithCheckoutCallback: jest.fn(),
    };
    const paymentMethod = {
        ...getBraintree(),
        id: methodId,
        initializationData: {
            isAcceleratedCheckoutEnabled: true,
            shouldRunAcceleratedCheckout: true,
        },
    };

    beforeEach(() => {
        braintreeScriptLoader = new BraintreeScriptLoader(getScriptLoader(), window);
        braintreeIntegrationService = new BraintreeIntegrationService(
            braintreeScriptLoader,
            window,
        );
        browserStorage = new BrowserStorage('paypalConnect');
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        braintreeFastlaneUtils = new BraintreeFastlaneUtils(
            paymentIntegrationService,
            braintreeIntegrationService,
            browserStorage,
        );

        strategy = new BraintreeFastlaneCustomerStrategy(
            paymentIntegrationService,
            braintreeFastlaneUtils,
        );

        jest.spyOn(paymentIntegrationService, 'loadPaymentMethod');
        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );
        jest.spyOn(
            braintreeFastlaneUtils,
            'initializeBraintreeAcceleratedCheckoutOrThrow',
        ).mockImplementation(jest.fn);
        jest.spyOn(
            braintreeFastlaneUtils,
            'runPayPalFastlaneAuthenticationFlowOrThrow',
        ).mockImplementation(jest.fn);
        jest.spyOn(
            braintreeFastlaneUtils,
            'runPayPalConnectAuthenticationFlowOrThrow',
        ).mockImplementation(jest.fn);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('#initialize()', () => {
        it('throw an error if the method id is not provided', async () => {
            try {
                await strategy.initialize({});
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('initializes Braintree Connect if isAcceleratedCheckoutEnabled is enabled', async () => {
            const mockPaymentMethod = {
                ...paymentMethod,
                initializationData: {
                    isAcceleratedCheckoutEnabled: true,
                },
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(mockPaymentMethod);

            await strategy.initialize(initializationOptions);

            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith(methodId);
            expect(
                braintreeFastlaneUtils.initializeBraintreeAcceleratedCheckoutOrThrow,
            ).toHaveBeenCalledWith(methodId, undefined);
        });

        it('initializes Braintree Fastlane if isFastlaneEnabled is enabled', async () => {
            const mockPaymentMethod = {
                ...paymentMethod,
                initializationData: {
                    isFastlaneEnabled: true,
                    isAcceleratedCheckoutEnabled: true,
                },
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(mockPaymentMethod);

            await strategy.initialize(initializationOptions);

            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith(methodId);
            expect(
                braintreeFastlaneUtils.initializeBraintreeAcceleratedCheckoutOrThrow,
            ).toHaveBeenCalledWith(methodId, undefined);
        });

        it('initializes Braintree Fastlane prior to Braintree Accelerated checkout', async () => {
            const mockPaymentMethod = {
                ...paymentMethod,
                initializationData: {
                    isFastlaneEnabled: true,
                    isAcceleratedCheckoutEnabled: true,
                },
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(mockPaymentMethod);

            await strategy.initialize(initializationOptions);

            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith(methodId);
            expect(
                braintreeFastlaneUtils.initializeBraintreeAcceleratedCheckoutOrThrow,
            ).toHaveBeenCalledWith(methodId, undefined);
        });

        it('loads another payment method if the primary load throws an error', async () => {
            jest.spyOn(paymentIntegrationService, 'loadPaymentMethod').mockImplementationOnce(
                () => {
                    throw new Error();
                },
            );

            await strategy.initialize(initializationOptions);

            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith(methodId);
            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith('braintree');
        });

        it('does not initialize Braintree Connect if isAcceleratedCheckoutEnabled is disabled', async () => {
            const mockPaymentMethod = {
                ...paymentMethod,
                initializationData: {
                    isAcceleratedCheckoutEnabled: false,
                },
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(mockPaymentMethod);

            await strategy.initialize(initializationOptions);

            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith(methodId);
            expect(
                braintreeFastlaneUtils.initializeBraintreeAcceleratedCheckoutOrThrow,
            ).not.toHaveBeenCalled();
        });

        it('does not initialize Braintree Fastlane if isFastlaneEnabled is disabled', async () => {
            const mockPaymentMethod = {
                ...paymentMethod,
                initializationData: {
                    isFastlaneEnabled: false,
                },
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(mockPaymentMethod);

            await strategy.initialize(initializationOptions);

            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith(methodId);
            expect(
                braintreeFastlaneUtils.initializeBraintreeAcceleratedCheckoutOrThrow,
            ).not.toHaveBeenCalled();
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

        it('authenticates user with PayPal Connect', async () => {
            await strategy.initialize({ methodId });
            await strategy.executePaymentMethodCheckout(executionOptions);

            expect(
                braintreeFastlaneUtils.runPayPalConnectAuthenticationFlowOrThrow,
            ).toHaveBeenCalled();
        });

        it('authenticates user with PayPal Fastlane', async () => {
            const mockPaymentMethod = {
                ...paymentMethod,
                initializationData: {
                    isFastlaneEnabled: true,
                    isAcceleratedCheckoutEnabled: true,
                    shouldRunAcceleratedCheckout: true,
                },
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(mockPaymentMethod);

            await strategy.initialize({ methodId });
            await strategy.executePaymentMethodCheckout(executionOptions);

            expect(
                braintreeFastlaneUtils.runPayPalFastlaneAuthenticationFlowOrThrow,
            ).toHaveBeenCalled();
        });

        it('authenticates user with PayPal Fastlane even when Paypal Accelerated checkout enabled', async () => {
            const mockPaymentMethod = {
                ...paymentMethod,
                initializationData: {
                    isFastlaneEnabled: true,
                    isAcceleratedCheckoutEnabled: true,
                    shouldRunAcceleratedCheckout: true,
                },
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(mockPaymentMethod);

            await strategy.initialize({ methodId });
            await strategy.executePaymentMethodCheckout(executionOptions);

            expect(
                braintreeFastlaneUtils.runPayPalFastlaneAuthenticationFlowOrThrow,
            ).toHaveBeenCalled();
            expect(
                braintreeFastlaneUtils.runPayPalConnectAuthenticationFlowOrThrow,
            ).not.toHaveBeenCalled();
        });

        it('calls checkoutPaymentMethodExecuted and continueWithCheckoutCallback after payment method execution', async () => {
            await strategy.initialize({ methodId });
            await strategy.executePaymentMethodCheckout(executionOptions);

            expect(executionOptions.checkoutPaymentMethodExecuted).toHaveBeenCalled();
            expect(executionOptions.continueWithCheckoutCallback).toHaveBeenCalled();
        });
    });

    describe('#shouldRunAuthenticationFlow() & #runPayPalConnectAuthenticationFlowOrThrow()', () => {
        it('authenticates customer with PayPal Connect', async () => {
            await strategy.initialize({ methodId });
            await strategy.executePaymentMethodCheckout(executionOptions);

            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith(methodId);
            expect(
                braintreeFastlaneUtils.initializeBraintreeAcceleratedCheckoutOrThrow,
            ).toHaveBeenCalledWith(methodId, undefined);
            expect(
                braintreeFastlaneUtils.runPayPalConnectAuthenticationFlowOrThrow,
            ).toHaveBeenCalled();
        });

        it('does not authenticate customer with PayPal Connect if it should not run due to A/B testing', async () => {
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
                braintreeFastlaneUtils.initializeBraintreeAcceleratedCheckoutOrThrow,
            ).toHaveBeenCalled();
            expect(
                braintreeFastlaneUtils.runPayPalConnectAuthenticationFlowOrThrow,
            ).not.toHaveBeenCalled();
        });

        it('does not authenticate customer with PayPal Connect if Fastlane is disabled', async () => {
            const mockPaymentMethod = {
                ...paymentMethod,
                initializationData: {
                    isFastlaneEnabled: false,
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
                braintreeFastlaneUtils.initializeBraintreeAcceleratedCheckoutOrThrow,
            ).not.toHaveBeenCalled();
            expect(
                braintreeFastlaneUtils.runPayPalConnectAuthenticationFlowOrThrow,
            ).not.toHaveBeenCalled();
        });

        // Info: valid only for A/B testing
        it('loads extra payment method if braintreeacceleratedcheckout didnt load before', async () => {
            const mockPaymentMethod = {
                ...paymentMethod,
                initializationData: {
                    isAcceleratedCheckoutEnabled: true,
                    shouldRunAcceleratedCheckout: true,
                },
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(mockPaymentMethod);

            await strategy.initialize({ methodId: 'braintree' });
            await strategy.executePaymentMethodCheckout({
                ...executionOptions,
                methodId: 'braintree',
            });

            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith('braintree');
            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith(methodId);
            expect(
                braintreeFastlaneUtils.initializeBraintreeAcceleratedCheckoutOrThrow,
            ).toHaveBeenCalled();
            expect(
                braintreeFastlaneUtils.runPayPalConnectAuthenticationFlowOrThrow,
            ).toHaveBeenCalled();
        });
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
