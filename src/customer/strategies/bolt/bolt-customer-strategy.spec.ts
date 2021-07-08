import { createAction } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { of } from 'rxjs';

import { BillingAddressActionCreator, BillingAddressActionType, BillingAddressRequestSender } from '../../../billing';
import { createCheckoutStore, CheckoutActionCreator, CheckoutRequestSender, CheckoutStore } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { MutationObserverFactory } from '../../../common/dom';
import { InvalidArgumentError, MissingDataError } from '../../../common/error/errors';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../../../form';
import { PaymentMethod, PaymentMethodActionCreator, PaymentMethodRequestSender } from '../../../payment';
import { getBolt } from '../../../payment/payment-methods.mock';
import { BoltCheckout, BoltScriptLoader } from '../../../payment/strategies/bolt';
import { getQuote } from '../../../quote/internal-quotes.mock';
import { GoogleRecaptcha, GoogleRecaptchaScriptLoader, GoogleRecaptchaWindow, SpamProtectionActionCreator, SpamProtectionRequestSender } from '../../../spam-protection';
import { SubscriptionsActionCreator, SubscriptionsRequestSender } from '../../../subscription';
import CustomerActionCreator from '../../customer-action-creator';
import { CustomerActionType } from '../../customer-actions';
import CustomerRequestSender from '../../customer-request-sender';
import CustomerStrategy from '../customer-strategy';

import BoltCustomerStrategy from './bolt-customer-strategy';

describe('BoltCustomerStrategy', () => {
    let billingAddressActionCreator: BillingAddressActionCreator;
    let boltScriptLoader: BoltScriptLoader;
    let boltCheckout: BoltCheckout;
    let customerActionCreator: CustomerActionCreator;
    let googleRecaptcha: GoogleRecaptcha;
    let googleRecaptchaMockWindow: GoogleRecaptchaWindow;
    let googleRecaptchaScriptLoader: GoogleRecaptchaScriptLoader;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentMethodMock: PaymentMethod;
    let store: CheckoutStore;
    let strategy: CustomerStrategy;

    beforeEach(() => {
        const scriptLoader = createScriptLoader();
        paymentMethodMock = getBolt();
        store = createCheckoutStore(getCheckoutStoreState());

        googleRecaptchaMockWindow = { grecaptcha: {} } as GoogleRecaptchaWindow;
        googleRecaptchaScriptLoader = new GoogleRecaptchaScriptLoader(createScriptLoader(), googleRecaptchaMockWindow);
        googleRecaptcha = new GoogleRecaptcha(googleRecaptchaScriptLoader, new MutationObserverFactory());

        billingAddressActionCreator = new BillingAddressActionCreator(
            new BillingAddressRequestSender(createRequestSender()),
            new SubscriptionsActionCreator(
                new SubscriptionsRequestSender(createRequestSender())
            )
        );

        boltCheckout = {} as BoltCheckout;
        boltCheckout.configure = jest.fn();
        boltCheckout.setClientCustomCallbacks = jest.fn();
        boltCheckout.openCheckout = jest.fn();
        boltCheckout.hasBoltAccount = jest.fn();

        boltScriptLoader = new BoltScriptLoader(scriptLoader);
        boltScriptLoader.load = jest.fn(() => Promise.resolve(boltCheckout));

        customerActionCreator = new CustomerActionCreator(
            new CustomerRequestSender(createRequestSender()),
            new CheckoutActionCreator(
                new CheckoutRequestSender(createRequestSender()),
                new ConfigActionCreator(new ConfigRequestSender(createRequestSender())),
                new FormFieldsActionCreator(new FormFieldsRequestSender(createRequestSender()))
            ),
            new SpamProtectionActionCreator(
                googleRecaptcha,
                new SpamProtectionRequestSender(createRequestSender())
            )
        );

        paymentMethodActionCreator = new PaymentMethodActionCreator(new PaymentMethodRequestSender(createRequestSender()));

        jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(paymentMethodMock);

        strategy = new BoltCustomerStrategy(
            store,
            boltScriptLoader,
            paymentMethodActionCreator,
            billingAddressActionCreator,
            customerActionCreator
        );
    });

    it('creates an instance of BoltCustomerStrategy', () => {
        expect(strategy).toBeInstanceOf(BoltCustomerStrategy);
    });

    describe('#initialize()', () => {
        it('fails to initialize the strategy if methodId is not provided', async () => {
            try {
                await strategy.initialize({ methodId: undefined });
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('fails to initialize the strategy if publishableKey option is not provided', async () => {
            paymentMethodMock.initializationData.publishableKey = undefined;

            try {
                await strategy.initialize({ methodId: 'bolt' });
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('loads bolt script loader', async () => {
            await strategy.initialize({ methodId: 'bolt' });

            expect(boltScriptLoader.load).toHaveBeenCalled();
        });
    });

    describe('#continueAsGuest()', () => {
        beforeEach(async () => {
            jest.spyOn(store.getState().customer, 'getCustomer').mockReturnValue(undefined);

            await strategy.initialize({ methodId: 'bolt' });
        });

        it('fails to continueAsGuest if methodId is not provided', async () => {
            const credentials = { email: 'test@test.com' };
            const options = { methodId: undefined };

            try {
                await strategy.continueAsGuest(credentials, options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('should pass default `continue as guest` flow if provider customContinueFlowEnabled is false', async () => {
            paymentMethodMock.initializationData.customContinueFlowEnabled = false;

            const credentials = { email: 'test@test.com' };
            const options = { methodId: 'bolt' };
            const action = of(createAction(BillingAddressActionType.ContinueAsGuestRequested, getQuote()));

            jest.spyOn(billingAddressActionCreator, 'continueAsGuest').mockReturnValue(action);
            jest.spyOn(boltCheckout, 'hasBoltAccount');
            jest.spyOn(boltCheckout, 'openCheckout');
            jest.spyOn(store, 'dispatch');

            await strategy.continueAsGuest(credentials, options);

            expect(boltCheckout.hasBoltAccount).not.toHaveBeenCalled();
            expect(boltCheckout.openCheckout).not.toHaveBeenCalled();
            expect(billingAddressActionCreator.continueAsGuest).toHaveBeenCalledWith(credentials, options);
        });

        it('should check is shopper has bolt account when provider customContinueFlowEnabled', async () => {
            paymentMethodMock.initializationData.customContinueFlowEnabled = true;

            const credentials = { email: 'test@test.com' };
            const options = { methodId: 'bolt' };
            const action = of(createAction(BillingAddressActionType.ContinueAsGuestRequested, getQuote()));

            jest.spyOn(billingAddressActionCreator, 'continueAsGuest').mockReturnValue(action);
            jest.spyOn(boltCheckout, 'hasBoltAccount');
            jest.spyOn(store, 'dispatch');

            await strategy.continueAsGuest(credentials, options);

            expect(boltCheckout.hasBoltAccount).toHaveBeenCalledWith(credentials.email);
            expect(billingAddressActionCreator.continueAsGuest).toHaveBeenCalledWith(credentials, options);
        });
    });

    describe('#signIn()', () => {
        beforeEach(async () => {
            jest.spyOn(store.getState().customer, 'getCustomer').mockReturnValue(undefined);

            await strategy.initialize({ methodId: 'bolt' });
        });

        it('fails to signIn if methodId is not provided', async () => {
            const credentials = { email: 'test@test.com', password: 'password' };
            const options = { methodId: undefined };

            try {
                await strategy.signIn(credentials, options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('should be checked if user has bolt account after successfully signIn', async () => {
            paymentMethodMock.initializationData.customContinueFlowEnabled = true;

            const credentials = { email: 'test@test.com', password: 'password' };
            const options = { methodId: 'bolt' };
            const action = of(createAction(CustomerActionType.SignInCustomerRequested, getQuote()));

            jest.spyOn(customerActionCreator, 'signInCustomer').mockReturnValue(action);
            jest.spyOn(boltCheckout, 'hasBoltAccount');
            jest.spyOn(store, 'dispatch');

            await strategy.signIn(credentials, options);

            expect(customerActionCreator.signInCustomer).toHaveBeenCalledWith(credentials, options);
            expect(boltCheckout.hasBoltAccount).toHaveBeenCalledWith(credentials.email);
        });

        it('should not be opened Bolt checkout modal after signIn if customContinueFlowEnabled is false', async () => {
            paymentMethodMock.initializationData.customContinueFlowEnabled = false;

            const credentials = { email: 'test@test.com', password: 'password' };
            const options = { methodId: 'bolt' };
            const action = of(createAction(CustomerActionType.SignInCustomerFailed, getQuote()));

            jest.spyOn(customerActionCreator, 'signInCustomer').mockReturnValue(action);
            jest.spyOn(boltCheckout, 'hasBoltAccount');
            jest.spyOn(boltCheckout, 'openCheckout');
            jest.spyOn(store, 'dispatch');

            await strategy.signIn(credentials, options);

            expect(customerActionCreator.signInCustomer).toHaveBeenCalledWith(credentials, options);
            expect(boltCheckout.hasBoltAccount).not.toHaveBeenCalled();
            expect(boltCheckout.openCheckout).not.toHaveBeenCalled();
        });
    });

    describe('#signOut()', () => {
        it('runs default signOut flow', async () => {
            const options = { methodId: 'bolt' };
            const action = of(createAction(CustomerActionType.SignOutCustomerRequested, getQuote()));

            jest.spyOn(customerActionCreator, 'signOutCustomer')
                .mockReturnValue(action);

            jest.spyOn(store, 'dispatch');

            await strategy.signOut(options);

            expect(customerActionCreator.signOutCustomer).toHaveBeenCalledWith(options);
            expect(store.dispatch).toHaveBeenCalledWith(action);
        });
    });

    describe('#signUp()', () => {
        beforeEach(async () => {
            jest.spyOn(store.getState().customer, 'getCustomer').mockReturnValue(undefined);

            await strategy.initialize({ methodId: 'bolt' });
        });

        it('fails to signUp if methodId is not provided', async () => {
            const customerAccount = { firstName: 'foo', lastName: 'bar', email: 'foo@bar.com', password: 'foobar' };
            const options = { methodId: undefined };

            try {
                await strategy.signUp(customerAccount, options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('should be checked if shopper has bolt account after successfully signUp', async () => {
            paymentMethodMock.initializationData.customContinueFlowEnabled = true;

            const customerAccount = { firstName: 'foo', lastName: 'bar', email: 'foo@bar.com', password: 'foobar' };
            const options = { methodId: 'bolt' };
            const action = of(createAction(CustomerActionType.CreateCustomerRequested, getQuote()));

            jest.spyOn(customerActionCreator, 'createCustomer').mockReturnValue(action);
            jest.spyOn(boltCheckout, 'hasBoltAccount');
            jest.spyOn(store, 'dispatch');

            await strategy.signUp(customerAccount, options);

            expect(customerActionCreator.createCustomer).toHaveBeenCalledWith(customerAccount, options);
            expect(boltCheckout.hasBoltAccount).toHaveBeenCalledWith(customerAccount.email);
        });

        it('should not open Bolt checkout modal after signUp if customContinueFlowEnabled is false', done => {
            paymentMethodMock.initializationData.customContinueFlowEnabled = false;

            const customerAccount = { firstName: 'foo', lastName: 'bar', email: 'foo@bar.com', password: 'foobar' };
            const options = { methodId: 'bolt' };
            const action = of(createAction(CustomerActionType.SignInCustomerFailed, getQuote()));

            jest.spyOn(customerActionCreator, 'createCustomer').mockReturnValue(action);
            jest.spyOn(boltCheckout, 'hasBoltAccount');
            jest.spyOn(boltCheckout, 'openCheckout');
            jest.spyOn(store, 'dispatch');

            strategy.signUp(customerAccount, options)
                .then(() => {
                    expect(customerActionCreator.createCustomer).toHaveBeenCalledWith(customerAccount, options);
                    expect(boltCheckout.hasBoltAccount).not.toHaveBeenCalled();
                    expect(boltCheckout.openCheckout).not.toHaveBeenCalled();
                    done();
                });
        });
    });
});
