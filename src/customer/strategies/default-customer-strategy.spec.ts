import { createAction } from '@bigcommerce/data-store';
import 'rxjs/add/observable/of';
import { Observable } from 'rxjs/Observable';
import { CheckoutClient, CheckoutStore, createCheckoutClient, createCheckoutStore } from '../../checkout';
import createSignInCustomerService from '../../customer/create-sign-in-customer-service';
import { getQuote } from '../../quote/internal-quotes.mock';
import CustomerActionCreator from '../customer-action-creator';
import { SIGN_IN_CUSTOMER_SUCCEEDED, SIGN_OUT_CUSTOMER_SUCCEEDED } from '../customer-action-types';
import SignInCustomerService from '../sign-in-customer-service';
import DefaultCustomerStrategy from './default-customer-strategy';

describe('DefaultCustomerStrategy', () => {
    let customerActionCreator: CustomerActionCreator;
    let client: CheckoutClient;
    let store: CheckoutStore;
    let signInCustomerService: SignInCustomerService;

    beforeEach(() => {
        store = createCheckoutStore();
        client = createCheckoutClient();
        customerActionCreator = new CustomerActionCreator(client);
        signInCustomerService = createSignInCustomerService(store, client);
    });

    it('dispatches action to sign in customer', async () => {
        const strategy = new DefaultCustomerStrategy(store, signInCustomerService, customerActionCreator);
        const credentials = { email: 'foo@bar.com', password: 'foobar' };
        const options = {};
        const action = Observable.of(createAction(SIGN_IN_CUSTOMER_SUCCEEDED, getQuote()));

        jest.spyOn(customerActionCreator, 'signInCustomer')
            .mockReturnValue(action);

        jest.spyOn(store, 'dispatch');

        const output = await strategy.signIn(credentials, options);

        expect(customerActionCreator.signInCustomer).toHaveBeenCalledWith(credentials, options);
        expect(store.dispatch).toHaveBeenCalledWith(action);
        expect(output).toEqual(store.getState());
    });

    it('dispatches action to sign out customer', async () => {
        const strategy = new DefaultCustomerStrategy(store, signInCustomerService, customerActionCreator);
        const options = {};
        const action = Observable.of(createAction(SIGN_OUT_CUSTOMER_SUCCEEDED, getQuote()));

        jest.spyOn(customerActionCreator, 'signOutCustomer')
            .mockReturnValue(action);

        jest.spyOn(store, 'dispatch');

        const output = await strategy.signOut(options);

        expect(customerActionCreator.signOutCustomer).toHaveBeenCalledWith(options);
        expect(store.dispatch).toHaveBeenCalledWith(action);
        expect(output).toEqual(store.getState());
    });
});
