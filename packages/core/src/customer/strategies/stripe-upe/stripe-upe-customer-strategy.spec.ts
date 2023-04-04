import { createAction } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';
import { Observable, of } from 'rxjs';

import { getBillingAddress } from '../../../billing/billing-addresses.mock';
import {
    CheckoutActionCreator,
    CheckoutRequestSender,
    CheckoutStore,
    createCheckoutStore,
} from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { MutationObserverFactory } from '../../../common/dom';
import { InvalidArgumentError, MissingDataError } from '../../../common/error/errors';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../../../form';
import {
    LoadPaymentMethodAction,
    PaymentMethod,
    PaymentMethodActionCreator,
    PaymentMethodActionType,
    PaymentMethodRequestSender,
} from '../../../payment';
import { getStripeUPE } from '../../../payment/payment-methods.mock';
import {
    StripeCustomerEvent,
    StripeElement,
    StripeHostWindow,
    StripeScriptLoader,
    StripeUPEClient,
} from '../../../payment/strategies/stripe-upe';
import { getQuote } from '../../../quote/internal-quotes.mock';
import {
    ConsignmentActionCreator,
    ConsignmentActionType,
    ConsignmentRequestSender,
} from '../../../shipping';
import { getConsignment } from '../../../shipping/consignments.mock';
import {
    GoogleRecaptcha,
    GoogleRecaptchaScriptLoader,
    GoogleRecaptchaWindow,
    SpamProtectionActionCreator,
    SpamProtectionRequestSender,
} from '../../../spam-protection';
import CustomerActionCreator from '../../customer-action-creator';
import { CustomerActionType } from '../../customer-actions';
import { CustomerInitializeOptions } from '../../customer-request-options';
import CustomerRequestSender from '../../customer-request-sender';
import { getCustomer, getGuestCustomer } from '../../customers.mock';
import CustomerStrategy from '../customer-strategy';

import StripeUPECustomerStrategy from './stripe-upe-customer-strategy';
import {
    getCustomerStripeUPEJsMock,
    getStripeUPECustomerInitializeOptionsMock,
} from './stripe-upe-customer.mock';

describe('StripeUpeCustomerStrategy', () => {
    const mockWindow = { grecaptcha: {} } as GoogleRecaptchaWindow;
    const googleRecaptchaScriptLoader = new GoogleRecaptchaScriptLoader(
        new ScriptLoader(),
        mockWindow,
    );
    const mutationObserverFactory = new MutationObserverFactory();
    const googleRecaptcha = new GoogleRecaptcha(
        googleRecaptchaScriptLoader,
        mutationObserverFactory,
    );
    const requestSender = createRequestSender();

    let consignmentActionCreator: ConsignmentActionCreator;
    let customerActionCreator: CustomerActionCreator;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentMethodMock: PaymentMethod;
    let store: CheckoutStore;
    let strategy: CustomerStrategy;
    let stripeScriptLoader: StripeScriptLoader;
    let stripeUPEJsMock: StripeUPEClient;
    let loadPaymentMethodAction: Observable<LoadPaymentMethodAction>;

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
        store = createCheckoutStore(getCheckoutStoreState());
        paymentMethodMock = { ...getStripeUPE(), clientToken: 'myToken' };
        loadPaymentMethodAction = of(
            createAction(PaymentMethodActionType.LoadPaymentMethodSucceeded, paymentMethodMock, {
                methodId: `stripeupe?method=card`,
            }),
        );
        stripeScriptLoader = new StripeScriptLoader(createScriptLoader());

        consignmentActionCreator = new ConsignmentActionCreator(
            new ConsignmentRequestSender(requestSender),
            new CheckoutRequestSender(requestSender),
        );

        customerActionCreator = new CustomerActionCreator(
            new CustomerRequestSender(requestSender),
            new CheckoutActionCreator(
                new CheckoutRequestSender(requestSender),
                new ConfigActionCreator(new ConfigRequestSender(requestSender)),
                new FormFieldsActionCreator(new FormFieldsRequestSender(requestSender)),
            ),
            new SpamProtectionActionCreator(
                googleRecaptcha,
                new SpamProtectionRequestSender(requestSender),
            ),
        );

        paymentMethodActionCreator = new PaymentMethodActionCreator(
            new PaymentMethodRequestSender(requestSender),
        );

        jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(
            paymentMethodMock,
        );
        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockReturnValue(
            loadPaymentMethodAction,
        );
        paymentMethodActionCreator.loadPaymentMethod = jest.fn(() => loadPaymentMethodAction);
        stripeUPEJsMock = getCustomerStripeUPEJsMock();
        jest.spyOn(stripeScriptLoader, 'getStripeClient').mockResolvedValue(stripeUPEJsMock);

        strategy = new StripeUPECustomerStrategy(
            store,
            stripeScriptLoader,
            customerActionCreator,
            paymentMethodActionCreator,
            consignmentActionCreator,
        );
    });

    describe('#initialize()', () => {
        const customer = getCustomer();
        let customerInitialization: CustomerInitializeOptions;

        beforeEach(() => {
            jest.spyOn(store.getState().customer, 'getCustomer').mockReturnValue(customer);
            customerInitialization = getStripeUPECustomerInitializeOptionsMock();
            jest.spyOn(store.getState().customer, 'getCustomerOrThrow').mockReturnValue(
                getGuestCustomer,
            );
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(
                getStripeUPE(),
            );
        });

        afterEach(() => {
            delete (window as StripeHostWindow).bcStripeElements;
            jest.resetAllMocks();
        });

        it('loads a single instance of StripeUPEClient and StripeElements', async () => {
            await expect(strategy.initialize(customerInitialization)).resolves.toBe(
                store.getState(),
            );

            expect(stripeScriptLoader.getStripeClient).toHaveBeenCalledTimes(1);
            expect(stripeUPEJsMock.elements).toHaveBeenCalledTimes(1);
        });

        it('loads a single instance of StripeUPEClient and StripeElements when email is provided', async () => {
            jest.spyOn(store.getState().billingAddress, 'getBillingAddress').mockReturnValue(
                getBillingAddress(),
            );

            await expect(strategy.initialize(customerInitialization)).resolves.toBe(
                store.getState(),
            );

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

            const expectedAction = {
                type: CustomerActionType.StripeLinkAuthenticated,
                payload: true,
            };

            const stripeUPEJsMockWithElement = getCustomerStripeUPEJsMock(stripeMockElement);
            const action = of(createAction(ConsignmentActionType.DeleteConsignmentSucceeded));

            jest.spyOn(store.getState().consignments, 'getConsignments').mockReturnValue([
                getConsignment(),
            ]);
            jest.spyOn(consignmentActionCreator, 'deleteConsignment').mockReturnValue(action);
            jest.spyOn(stripeScriptLoader, 'getStripeClient').mockResolvedValueOnce(
                stripeUPEJsMockWithElement,
            );

            await expect(strategy.initialize(customerInitialization)).resolves.toEqual(
                store.getState(),
            );

            expect(consignmentActionCreator.deleteConsignment).toHaveBeenNthCalledWith(
                1,
                getConsignment().id,
            );
            expect(store.dispatch).toHaveBeenNthCalledWith(2, expectedAction);
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

            const expectedAction = {
                type: CustomerActionType.StripeLinkAuthenticated,
                payload: true,
            };

            const stripeUPEJsMockWithElement = getCustomerStripeUPEJsMock(stripeMockElement);
            const action = of(createAction(ConsignmentActionType.DeleteConsignmentSucceeded));

            jest.spyOn(store.getState().consignments, 'getConsignments').mockReturnValue([
                getConsignment(),
            ]);
            jest.spyOn(consignmentActionCreator, 'deleteConsignment').mockReturnValue(action);
            jest.spyOn(stripeScriptLoader, 'getStripeClient').mockResolvedValueOnce(
                stripeUPEJsMockWithElement,
            );
            jest.spyOn(store.getState().customer, 'getCustomerOrThrow').mockReturnValue({
                ...getGuestCustomer,
                isStripeLinkAuthenticated: true,
            });

            await expect(strategy.initialize(customerInitialization)).resolves.toEqual(
                store.getState(),
            );

            expect(consignmentActionCreator.deleteConsignment).not.toHaveBeenCalled();
            expect(store.dispatch).toHaveBeenNthCalledWith(2, expectedAction);
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

            const expectedAction = {
                type: CustomerActionType.StripeLinkAuthenticated,
                payload: true,
            };

            const stripeUPEJsMockWithElement = getCustomerStripeUPEJsMock(stripeMockElement);

            jest.spyOn(stripeScriptLoader, 'getStripeClient').mockResolvedValueOnce(
                stripeUPEJsMockWithElement,
            );

            await expect(strategy.initialize(customerInitialization)).resolves.toEqual(
                store.getState(),
            );

            expect(store.dispatch).toHaveBeenNthCalledWith(2, expectedAction);
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

            await expect(strategy.initialize(customerInitialization)).resolves.toEqual(
                store.getState(),
            );

            expect(customerInitialization.stripeupe?.onEmailChange).toHaveBeenCalledWith(false, '');
        });

        it('returns an error when methodId is not present', async () => {
            const promise = strategy.initialize({
                ...getStripeUPECustomerInitializeOptionsMock(),
                stripeupe: undefined,
                methodId: '',
            });

            expect(promise).rejects.toBeInstanceOf(InvalidArgumentError);
        });

        it('returns an error when stripePublishableKey, or clientToken is not present', () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue({
                ...getStripeUPE(),
                initializationData: {},
            });

            const promise = strategy.initialize(customerInitialization);

            expect(promise).rejects.toBeInstanceOf(MissingDataError);
        });
    });

    describe('#signIn()', () => {
        it('dispatches action to sign in customer', async () => {
            const credentials = { email: 'foo@bar.com', password: 'foobar' };
            const options = {};
            const action = of(createAction(CustomerActionType.SignInCustomerRequested, getQuote()));

            jest.spyOn(customerActionCreator, 'signInCustomer').mockReturnValue(action);

            jest.spyOn(store, 'dispatch');

            await strategy.signIn(credentials, options);

            expect(customerActionCreator.signInCustomer).toHaveBeenCalledWith(credentials, options);
            expect(store.dispatch).toHaveBeenCalledWith(action);
        });
    });

    describe('#signOut()', () => {
        it('dispatches action to sign out customer', async () => {
            const options = {};
            const action = of(
                createAction(CustomerActionType.SignOutCustomerRequested, getQuote()),
            );

            jest.spyOn(customerActionCreator, 'signOutCustomer').mockReturnValue(action);

            jest.spyOn(store, 'dispatch');

            await strategy.signOut(options);

            expect(customerActionCreator.signOutCustomer).toHaveBeenCalledWith(options);
            expect(store.dispatch).toHaveBeenCalledWith(action);
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
