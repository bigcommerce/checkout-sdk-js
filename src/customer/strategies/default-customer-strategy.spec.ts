import { createAction } from '@bigcommerce/data-store';
import 'rxjs/add/observable/of';
import { Observable } from 'rxjs/Observable';

import { createCheckoutClient, createCheckoutStore, CheckoutClient, CheckoutStore } from '../../checkout';
import { getQuote } from '../../quote/internal-quotes.mock';
import CustomerActionCreator from '../customer-action-creator';
import { SIGN_IN_CUSTOMER_SUCCEEDED, SIGN_OUT_CUSTOMER_SUCCEEDED } from '../customer-action-types';

import DefaultCustomerStrategy from './default-customer-strategy';

describe('DefaultCustomerStrategy', () => {
    let customerActionCreator: CustomerActionCreator;
    let client: CheckoutClient;
    let store: CheckoutStore;

    beforeEach(() => {
        store = createCheckoutStore();
        client = createCheckoutClient();
        customerActionCreator = new CustomerActionCreator(client);
    });

    it('dispatches action to sign in customer', async () => {
        const strategy = new DefaultCustomerStrategy(store, customerActionCreator);
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
        const strategy = new DefaultCustomerStrategy(store, customerActionCreator);
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
