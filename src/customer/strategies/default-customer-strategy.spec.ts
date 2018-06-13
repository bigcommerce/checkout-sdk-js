import { createAction } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { Observable } from 'rxjs';

import { createCheckoutClient, createCheckoutStore, CheckoutActionCreator, CheckoutClient, CheckoutRequestSender, CheckoutStore } from '../../checkout';
import { getQuote } from '../../quote/internal-quotes.mock';
import CustomerActionCreator from '../customer-action-creator';
import { CustomerActionType } from '../customer-actions';
import CustomerRequestSender from '../customer-request-sender';

import DefaultCustomerStrategy from './default-customer-strategy';

describe('DefaultCustomerStrategy', () => {
    let customerActionCreator: CustomerActionCreator;
    let store: CheckoutStore;

    beforeEach(() => {
        store = createCheckoutStore();
        customerActionCreator = new CustomerActionCreator(
            new CustomerRequestSender(createRequestSender()),
            new CheckoutActionCreator(
                new CheckoutRequestSender(createRequestSender())
            )
        );
    });

    it('dispatches action to sign in customer', async () => {
        const strategy = new DefaultCustomerStrategy(store, customerActionCreator);
        const credentials = { email: 'foo@bar.com', password: 'foobar' };
        const options = {};
        const action = Observable.of(createAction(CustomerActionType.SignInCustomerRequested, getQuote()));

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
        const action = Observable.of(createAction(CustomerActionType.SignOutCustomerRequested, getQuote()));

        jest.spyOn(customerActionCreator, 'signOutCustomer')
            .mockReturnValue(action);

        jest.spyOn(store, 'dispatch');

        const output = await strategy.signOut(options);

        expect(customerActionCreator.signOutCustomer).toHaveBeenCalledWith(options);
        expect(store.dispatch).toHaveBeenCalledWith(action);
        expect(output).toEqual(store.getState());
    });
});
