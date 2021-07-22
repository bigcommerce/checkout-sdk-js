import { createAction } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { ScriptLoader } from '@bigcommerce/script-loader';
import { of } from 'rxjs';

import { BillingAddressActionCreator, BillingAddressActionType, BillingAddressRequestSender } from '../../../billing';
import { createCheckoutStore, CheckoutActionCreator, CheckoutRequestSender, CheckoutStore } from '../../../checkout';
import { MutationObserverFactory } from '../../../common/dom';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../../../form';
import { getQuote } from '../../../quote/internal-quotes.mock';
import { GoogleRecaptcha, GoogleRecaptchaScriptLoader, GoogleRecaptchaWindow, SpamProtectionActionCreator, SpamProtectionRequestSender } from '../../../spam-protection';
import { SubscriptionsActionCreator, SubscriptionsRequestSender } from '../../../subscription';
import CustomerActionCreator from '../../customer-action-creator';
import { CustomerActionType } from '../../customer-actions';
import CustomerRequestSender from '../../customer-request-sender';

import DefaultCustomerStrategy from './default-customer-strategy';

describe('DefaultCustomerStrategy', () => {
    let billingAddressActionCreator: BillingAddressActionCreator;
    let customerActionCreator: CustomerActionCreator;
    let store: CheckoutStore;

    beforeEach(() => {
        store = createCheckoutStore();
        const requestSender = createRequestSender();
        const scriptLoader = new ScriptLoader();
        const googleRecaptchaMockWindow = { grecaptcha: {} } as GoogleRecaptchaWindow;
        const googleRecaptchaScriptLoader = new GoogleRecaptchaScriptLoader(scriptLoader, googleRecaptchaMockWindow);
        const mutationObserverFactory = new MutationObserverFactory();
        const googleRecaptcha = new GoogleRecaptcha(googleRecaptchaScriptLoader, mutationObserverFactory);

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

        billingAddressActionCreator = new BillingAddressActionCreator(
            new BillingAddressRequestSender(requestSender),
            new SubscriptionsActionCreator(
                new SubscriptionsRequestSender(requestSender)
            )
        );
    });

    it('dispatches action to continue as guest', async () => {
        const strategy = new DefaultCustomerStrategy(store, billingAddressActionCreator, customerActionCreator);
        const credentials = { email: 'foo@bar.com' };
        const options = {};
        const action = of(createAction(BillingAddressActionType.ContinueAsGuestRequested, getQuote()));

        jest.spyOn(billingAddressActionCreator, 'continueAsGuest')
            .mockReturnValue(action);

        jest.spyOn(store, 'dispatch');

        const output = await strategy.continueAsGuest(credentials, options);

        expect(billingAddressActionCreator.continueAsGuest).toHaveBeenCalledWith(credentials, options);
        expect(store.dispatch).toHaveBeenCalledWith(action);
        expect(output).toEqual(store.getState());
    });

    it('dispatches action to sign in customer', async () => {
        const strategy = new DefaultCustomerStrategy(store, billingAddressActionCreator, customerActionCreator);
        const credentials = { email: 'foo@bar.com', password: 'foobar' };
        const options = {};
        const action = of(createAction(CustomerActionType.SignInCustomerRequested, getQuote()));

        jest.spyOn(customerActionCreator, 'signInCustomer')
            .mockReturnValue(action);

        jest.spyOn(store, 'dispatch');

        const output = await strategy.signIn(credentials, options);

        expect(customerActionCreator.signInCustomer).toHaveBeenCalledWith(credentials, options);
        expect(store.dispatch).toHaveBeenCalledWith(action);
        expect(output).toEqual(store.getState());
    });

    it('dispatches action to sign out customer', async () => {
        const strategy = new DefaultCustomerStrategy(store, billingAddressActionCreator, customerActionCreator);
        const options = {};
        const action = of(createAction(CustomerActionType.SignOutCustomerRequested, getQuote()));

        jest.spyOn(customerActionCreator, 'signOutCustomer')
            .mockReturnValue(action);

        jest.spyOn(store, 'dispatch');

        const output = await strategy.signOut(options);

        expect(customerActionCreator.signOutCustomer).toHaveBeenCalledWith(options);
        expect(store.dispatch).toHaveBeenCalledWith(action);
        expect(output).toEqual(store.getState());
    });

    it('dispatches action to sign up customer', async () => {
        const strategy = new DefaultCustomerStrategy(store, billingAddressActionCreator, customerActionCreator);
        const customerAccount = { firstName: 'foo', lastName: 'bar', email: 'foo@bar.com', password: 'foobar' };
        const options = {};
        const action = of(createAction(CustomerActionType.CreateCustomerRequested, getQuote()));

        jest.spyOn(customerActionCreator, 'createCustomer')
            .mockReturnValue(action);

        jest.spyOn(store, 'dispatch');

        const output = await strategy.signUp(customerAccount, options);

        expect(customerActionCreator.createCustomer).toHaveBeenCalledWith(customerAccount, options);
        expect(store.dispatch).toHaveBeenCalledWith(action);
        expect(output).toEqual(store.getState());
    });
});
