import { createScriptLoader } from '@bigcommerce/script-loader';

import {
    CustomerInitializeOptions,
    CustomerStrategy,
    InvalidArgumentError,
    MissingDataError,
    PaymentIntegrationService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getBillingAddress,
    getConsignment,
    getCustomer,
    getGuestCustomer,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import {
    StripeCustomerEvent,
    StripeElement,
    StripeHostWindow,
    StripeUPEClient,
} from './stripe-upe';
import StripeUPECustomerStrategy from './stripe-upe-customer-strategy';
import {
    getCustomerStripeUPEJsMock,
    getStripeUPECustomerInitializeOptionsMock,
} from './stripe-upe-customer.mock';
import StripeUPEScriptLoader from './stripe-upe-script-loader';
import { getStripeUPE } from './stripe-upe.mock';

describe('StripeUpeCustomerStrategy', () => {
    let paymentMethodMock: PaymentMethod;
    let strategy: CustomerStrategy;
    let stripeScriptLoader: StripeUPEScriptLoader;
    let stripeUPEJsMock: StripeUPEClient;
    let loadPaymentMethodAction: Promise<PaymentMethod>;
    let paymentIntegrationService: PaymentIntegrationService;

    const stripeCustomerEvent = (auth = false, complete = false): StripeCustomerEvent => {
        return {
            authenticated: auth,
            complete,
            elementType: '',
            empty: false,
            value: {
                email: 'foo@bar',
            },
        };
    };

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        paymentMethodMock = { ...getStripeUPE(), clientToken: 'myToken' };
        loadPaymentMethodAction = Promise.resolve(paymentMethodMock);
        stripeScriptLoader = new StripeUPEScriptLoader(createScriptLoader());

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethod').mockReturnValue(
            paymentMethodMock,
        );
        jest.spyOn(paymentIntegrationService, 'loadPaymentMethod').mockReturnValue(
            loadPaymentMethodAction,
        );
        paymentIntegrationService.loadPaymentMethod = jest.fn(() => loadPaymentMethodAction);
        stripeUPEJsMock = getCustomerStripeUPEJsMock();
        jest.spyOn(stripeScriptLoader, 'getStripeClient').mockResolvedValue(stripeUPEJsMock);

        jest.spyOn(
            paymentIntegrationService.getState(),
            'getPaymentProviderCustomerOrThrow',
        ).mockReturnValue({ stripeLinkAuthenticationState: true });

        strategy = new StripeUPECustomerStrategy(paymentIntegrationService, stripeScriptLoader);
    });

    afterEach(() => {
        delete (window as StripeHostWindow).bcStripeElements;
        jest.clearAllMocks();
    });

    describe('#initialize()', () => {
        const customer = getCustomer();
        let customerInitialization: CustomerInitializeOptions;

        beforeEach(() => {
            jest.spyOn(paymentIntegrationService.getState(), 'getCustomer').mockReturnValue(
                customer,
            );
            customerInitialization = getStripeUPECustomerInitializeOptionsMock();
            jest.spyOn(paymentIntegrationService.getState(), 'getCustomerOrThrow').mockReturnValue(
                getGuestCustomer,
            );
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(getStripeUPE());
        });

        afterEach(() => {
            delete (window as StripeHostWindow).bcStripeElements;
            jest.clearAllMocks();
        });

        it('loads a single instance of StripeUPEClient and StripeElements', async () => {
            await strategy.initialize(customerInitialization);

            expect(stripeScriptLoader.getStripeClient).toHaveBeenCalledTimes(1);
            expect(stripeUPEJsMock.elements).toHaveBeenCalledTimes(1);
        });

        it('loads a single instance of StripeUPEClient and StripeElements when email is provided', async () => {
            jest.spyOn(paymentIntegrationService.getState(), 'getBillingAddress').mockReturnValue(
                getBillingAddress(),
            );

            await strategy.initialize(customerInitialization);

            expect(stripeScriptLoader.getStripeClient).toHaveBeenCalledTimes(1);
            expect(stripeUPEJsMock.elements).toHaveBeenCalledTimes(1);
        });

        it('triggers onChange event callback, dispatches delete consignments action and mounts component', async () => {
            const stripeMockElement: StripeElement = {
                destroy: jest.fn(),
                mount: jest.fn(),
                unmount: jest.fn(),
                on: jest.fn((_, callback) => callback(stripeCustomerEvent(true, true))),
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentProviderCustomerOrThrow',
            ).mockReturnValue({ stripeLinkAuthenticationState: undefined });

            const stripeUPEJsMockWithElement = getCustomerStripeUPEJsMock(stripeMockElement);
            const action = Promise.resolve(true);

            jest.spyOn(paymentIntegrationService.getState(), 'getConsignments').mockReturnValue([
                getConsignment(),
            ]);
            jest.spyOn(paymentIntegrationService, 'deleteConsignment').mockReturnValue(action);
            jest.spyOn(stripeScriptLoader, 'getStripeClient').mockResolvedValueOnce(
                stripeUPEJsMockWithElement,
            );

            await strategy.initialize(customerInitialization);

            expect(paymentIntegrationService.deleteConsignment).toHaveBeenNthCalledWith(
                1,
                getConsignment().id,
            );

            expect(customerInitialization.stripeupe?.onEmailChange).toHaveBeenCalledWith(
                true,
                'foo@bar',
            );
            expect(customerInitialization.stripeupe?.isLoading).toHaveBeenCalled();
            expect(stripeMockElement.mount).toHaveBeenCalledWith(expect.any(String));
        });

        it('triggers onChange event callback without delete consignments action and mounts component', async () => {
            const stripeMockElement: StripeElement = {
                destroy: jest.fn(),
                mount: jest.fn(),
                unmount: jest.fn(),
                on: jest.fn((_, callback) => callback(stripeCustomerEvent(true, true))),
            };

            const stripeUPEJsMockWithElement = getCustomerStripeUPEJsMock(stripeMockElement);
            const action = Promise.resolve(true);

            jest.spyOn(paymentIntegrationService.getState(), 'getConsignments').mockReturnValue([
                getConsignment(),
            ]);
            jest.spyOn(paymentIntegrationService, 'deleteConsignment').mockReturnValue(action);
            jest.spyOn(stripeScriptLoader, 'getStripeClient').mockResolvedValueOnce(
                stripeUPEJsMockWithElement,
            );
            jest.spyOn(paymentIntegrationService.getState(), 'getCustomerOrThrow').mockReturnValue({
                ...getGuestCustomer,
            });
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentProviderCustomerOrThrow',
            ).mockReturnValue({ stripeLinkAuthenticationState: true });

            await strategy.initialize(customerInitialization);

            expect(paymentIntegrationService.deleteConsignment).not.toHaveBeenCalled();
            expect(customerInitialization.stripeupe?.onEmailChange).toHaveBeenCalledWith(
                true,
                'foo@bar',
            );
            expect(customerInitialization.stripeupe?.isLoading).toHaveBeenCalled();
            expect(stripeMockElement.mount).toHaveBeenCalledWith(expect.any(String));
        });

        it('triggers onChange event callback, dispatches correct action and mounts component', async () => {
            const stripeMockElement: StripeElement = {
                destroy: jest.fn(),
                mount: jest.fn(),
                unmount: jest.fn(),
                on: jest.fn((_, callback) => callback(stripeCustomerEvent(true, true))),
            };

            const stripeUPEJsMockWithElement = getCustomerStripeUPEJsMock(stripeMockElement);

            jest.spyOn(stripeScriptLoader, 'getStripeClient').mockResolvedValueOnce(
                stripeUPEJsMockWithElement,
            );

            await strategy.initialize(customerInitialization);

            expect(customerInitialization.stripeupe?.onEmailChange).toHaveBeenCalledWith(
                true,
                'foo@bar',
            );
            expect(customerInitialization.stripeupe?.isLoading).toHaveBeenCalled();
            expect(stripeMockElement.mount).toHaveBeenCalledWith(expect.any(String));
        });

        it('triggers onChange event callback and throws error if event data is missing', async () => {
            const missingAuthEvent = {
                complete: true,
                elementType: '',
                empty: false,
                value: {
                    email: 'foo@bar',
                },
            };

            const stripeMockElement: StripeElement = {
                destroy: jest.fn(),
                mount: jest.fn(),
                unmount: jest.fn(),
                on: jest.fn((_, callback) => callback(missingAuthEvent)),
            };

            const stripeUPEJsMockWithElement = getCustomerStripeUPEJsMock(stripeMockElement);

            jest.spyOn(stripeScriptLoader, 'getStripeClient').mockResolvedValue(
                stripeUPEJsMockWithElement,
            );

            await expect(strategy.initialize(customerInitialization)).rejects.toBeInstanceOf(
                MissingDataError,
            );
        });

        it('triggers onChange event callback without email if event is not complete', async () => {
            const missingCompletionEvent = {
                authenticated: true,
                complete: false,
                elementType: '',
                empty: false,
                value: {
                    email: 'foo@bar',
                },
            };

            const stripeMockElement: StripeElement = {
                destroy: jest.fn(),
                mount: jest.fn(),
                unmount: jest.fn(),
                on: jest.fn((_, callback) => callback(missingCompletionEvent)),
            };

            const stripeUPEJsMockWithElement = getCustomerStripeUPEJsMock(stripeMockElement);

            jest.spyOn(stripeScriptLoader, 'getStripeClient').mockResolvedValue(
                stripeUPEJsMockWithElement,
            );

            await strategy.initialize(customerInitialization);

            expect(customerInitialization.stripeupe?.onEmailChange).toHaveBeenCalledWith(false, '');
        });

        it('returns an error when methodId is not present', async () => {
            const promise = strategy.initialize({
                ...getStripeUPECustomerInitializeOptionsMock(),
                stripeupe: undefined,
                methodId: '',
            });

            await expect(promise).rejects.toBeInstanceOf(InvalidArgumentError);
        });

        it('returns an error when stripePublishableKey, or clientToken is not present', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue({
                ...getStripeUPE(),
                initializationData: {},
            });

            const promise = strategy.initialize(customerInitialization);

            await expect(promise).rejects.toBeInstanceOf(MissingDataError);
        });
    });

    describe('#signIn()', () => {
        it('call signInCustomer with specific arguments', async () => {
            const credentials = { email: 'foo@bar.com', password: 'foobar' };
            const options = {};

            await strategy.signIn(credentials, options);

            expect(paymentIntegrationService.signInCustomer).toHaveBeenCalledWith(
                credentials,
                options,
            );
        });
    });

    describe('#signOut()', () => {
        it('call signOutCustomer with specific arguments', async () => {
            const options = {};

            await strategy.signOut(options);

            expect(paymentIntegrationService.signOutCustomer).toHaveBeenCalledWith(options);
        });
    });

    describe('#executePaymentMethodCheckout', () => {
        it('runs continue callback automatically on execute payment method checkout', async () => {
            const mockCallback = jest.fn();

            await strategy.executePaymentMethodCheckout({
                continueWithCheckoutCallback: mockCallback,
            });

            expect(mockCallback.mock.calls).toHaveLength(1);
        });
    });
});
