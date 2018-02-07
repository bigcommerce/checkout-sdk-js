import { Observable } from 'rxjs/Observable';
import { CheckoutStore } from '../checkout';
import { createAction } from '../../data-store';
import * as actionTypes from './customer-action-types';
import CustomerActionCreator from './customer-action-creator';
import CustomerCredentials from './customer-credentials';
import SignInCustomerService from './sign-in-customer-service';
import createCheckoutClient from '../create-checkout-client';
import createCheckoutStore from '../create-checkout-store';

describe('SignInCustomerService', () => {
    let customerActionCreator: CustomerActionCreator;
    let store: CheckoutStore;

    beforeEach(() => {
        customerActionCreator = new CustomerActionCreator(createCheckoutClient());
        store = createCheckoutStore();
    });

    it('dispatches action to sign in customer', async () => {
        const service = new SignInCustomerService(store, customerActionCreator);
        const credentials: CustomerCredentials = { email: 'foo@bar.com' };
        const options = {};
        const action = Observable.of(createAction(actionTypes.SIGN_IN_CUSTOMER_REQUESTED));

        jest.spyOn(customerActionCreator, 'signInCustomer').mockReturnValue(action);
        jest.spyOn(store, 'dispatch');

        const output = await service.signIn(credentials, options);

        expect(customerActionCreator.signInCustomer).toHaveBeenCalledWith(credentials, options);
        expect(store.dispatch).toHaveBeenCalledWith(action);
        expect(output).toEqual(store.getState());
    });

    it('dispatches action to sign out customer', async () => {
        const service = new SignInCustomerService(store, customerActionCreator);
        const options = {};
        const action = Observable.of(createAction(actionTypes.SIGN_IN_CUSTOMER_REQUESTED));

        jest.spyOn(customerActionCreator, 'signOutCustomer').mockReturnValue(action);
        jest.spyOn(store, 'dispatch');

        const output = await service.signOut(options);

        expect(customerActionCreator.signOutCustomer).toHaveBeenCalledWith(options);
        expect(store.dispatch).toHaveBeenCalledWith(action);
        expect(output).toEqual(store.getState());
    });
});
