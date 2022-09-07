import { createAction } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';
import { of, Observable } from 'rxjs';

import { createCheckoutStore, CheckoutActionCreator, CheckoutRequestSender, CheckoutStore } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { MutationObserverFactory } from '../../../common/dom';
import { InvalidArgumentError, MissingDataError } from '../../../common/error/errors';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../../../form';
import { LoadPaymentMethodAction, PaymentMethod, PaymentMethodActionCreator, PaymentMethodActionType, PaymentMethodRequestSender } from '../../../payment';
import { getStripeUPE } from '../../../payment/payment-methods.mock';
import { StripeScriptLoader, StripeUPEClient } from '../../../payment/strategies/stripe-upe';
import { getQuote } from '../../../quote/internal-quotes.mock';
import { GoogleRecaptcha, GoogleRecaptchaScriptLoader, GoogleRecaptchaWindow, SpamProtectionActionCreator, SpamProtectionRequestSender } from '../../../spam-protection';
import CustomerActionCreator from '../../customer-action-creator';
import { CustomerActionType } from '../../customer-actions';
import { CustomerInitializeOptions } from '../../customer-request-options';
import CustomerRequestSender from '../../customer-request-sender';
import { getCustomer, getGuestCustomer } from '../../customers.mock';
import CustomerStrategy from '../customer-strategy';

import StripeUPECustomerStrategy from './stripe-upe-customer-strategy';
import { getCustomerStripeUPEJsMock, getStripeUPECustomerInitializeOptionsMock } from './stripe-upe-customer.mock';

describe('StripeUpeCustomerStrategy', () => {
    const mockWindow = { grecaptcha: {} } as GoogleRecaptchaWindow;
    const googleRecaptchaScriptLoader = new GoogleRecaptchaScriptLoader(new ScriptLoader(), mockWindow);
    const mutationObserverFactory = new MutationObserverFactory();
    const googleRecaptcha = new GoogleRecaptcha(googleRecaptchaScriptLoader, mutationObserverFactory);
    const requestSender = createRequestSender();

    let customerActionCreator: CustomerActionCreator;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentMethodMock: PaymentMethod;
    let store: CheckoutStore;
    let strategy: CustomerStrategy;
    let stripeScriptLoader: StripeScriptLoader;
    let stripeUPEJsMock: StripeUPEClient;
    let loadPaymentMethodAction: Observable<LoadPaymentMethodAction>;

    beforeEach(() => {
        store = createCheckoutStore(getCheckoutStoreState());
        paymentMethodMock = { ...getStripeUPE(), clientToken: 'myToken' };
        loadPaymentMethodAction = of(createAction(PaymentMethodActionType.LoadPaymentMethodSucceeded, paymentMethodMock, { methodId: `stripeupe?method=card`}));
        stripeScriptLoader = new StripeScriptLoader(createScriptLoader());

        customerActionCreator = new CustomerActionCreator(
            new CustomerRequestSender(requestSender),
            new CheckoutActionCreator(
                new CheckoutRequestSender(requestSender),
                new ConfigActionCreator(new ConfigRequestSender(requestSender)),
                new FormFieldsActionCreator(new FormFieldsRequestSender(requestSender))
            ),
            new SpamProtectionActionCreator(
                googleRecaptcha,
                new SpamProtectionRequestSender(requestSender)
            )
        );

        paymentMethodActionCreator = new PaymentMethodActionCreator(new PaymentMethodRequestSender(requestSender));

        jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(paymentMethodMock);
        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
            .mockReturnValue(loadPaymentMethodAction);
        paymentMethodActionCreator.loadPaymentMethod = jest.fn(() => loadPaymentMethodAction);
        stripeUPEJsMock = getCustomerStripeUPEJsMock();
        jest.spyOn(stripeScriptLoader, 'getStripeClient')
            .mockResolvedValue(stripeUPEJsMock);

        strategy = new StripeUPECustomerStrategy(
            store,
            stripeScriptLoader,
            customerActionCreator,
            paymentMethodActionCreator
        );
    });

    describe('#initialize()', () => {
        const customer = getCustomer();
        let customerInitialization: CustomerInitializeOptions;

        beforeEach(() => {
            jest.spyOn(store.getState().customer, 'getCustomer').mockReturnValue(customer);
            customerInitialization = getStripeUPECustomerInitializeOptionsMock();
            jest.spyOn(store.getState().customer, 'getCustomerOrThrow')
                .mockReturnValue(getGuestCustomer);
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
                .mockReturnValue(getStripeUPE());
        });

        afterEach(() => {
            jest.resetAllMocks();
        });

        it('loads a single instance of StripeUPEClient and StripeElements', async () => {
            await expect(strategy.initialize(customerInitialization)).resolves.toBe(store.getState());

            expect(stripeScriptLoader.getStripeClient).toHaveBeenCalledTimes(1);
            expect(stripeUPEJsMock.elements).toHaveBeenCalledTimes(1);
        });

        it('returns an error when methodId is not present', () => {
            const promise = strategy.initialize({ ...getStripeUPECustomerInitializeOptionsMock(), methodId: '' });

            expect(promise).rejects.toBeInstanceOf(InvalidArgumentError);

        });

        it('returns an error when stripePublishableKey, or clientToken is not present', () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
                .mockReturnValue({ ...getStripeUPE(), initializationData: {} });

            const promise = strategy.initialize(customerInitialization);

            expect(promise).rejects.toBeInstanceOf(MissingDataError);

        });
    });

    describe('#signIn()', () => {
        it('dispatches action to sign in customer', async () => {
            const credentials = {email: 'foo@bar.com', password: 'foobar'};
            const options = {};
            const action = of(createAction(CustomerActionType.SignInCustomerRequested, getQuote()));

            jest.spyOn(customerActionCreator, 'signInCustomer')
                .mockReturnValue(action);

            jest.spyOn(store, 'dispatch');

            await strategy.signIn(credentials, options);

            expect(customerActionCreator.signInCustomer).toHaveBeenCalledWith(credentials, options);
            expect(store.dispatch).toHaveBeenCalledWith(action);
        });
    });

    describe('#signOut()', () => {
        it('dispatches action to sign out customer', async () => {
            const options = {};
            const action = of(createAction(CustomerActionType.SignOutCustomerRequested, getQuote()));

            jest.spyOn(customerActionCreator, 'signOutCustomer')
                .mockReturnValue(action);

            jest.spyOn(store, 'dispatch');

            await strategy.signOut(options);

            expect(customerActionCreator.signOutCustomer).toHaveBeenCalledWith(options);
            expect(store.dispatch).toHaveBeenCalledWith(action);
        });
    });

    describe('#executePaymentMethodCheckout', () => {
        it('runs continue callback automatically on execute payment method checkout', async () => {
            const mockCallback = jest.fn();

            await strategy.executePaymentMethodCheckout({ continueWithCheckoutCallback: mockCallback });

            expect(mockCallback.mock.calls.length).toBe(1);
        });
    });
});
