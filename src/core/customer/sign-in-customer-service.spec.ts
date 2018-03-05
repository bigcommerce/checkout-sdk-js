import { Observable } from 'rxjs';
import { createAction } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createCheckoutClient, createCheckoutStore, CheckoutStore } from '../checkout';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../remote-checkout';
import * as actionTypes from './customer-action-types';
import * as remoteCheckoutActionTypes from '../remote-checkout/remote-checkout-action-types';
import CustomerActionCreator from './customer-action-creator';
import CustomerCredentials from './customer-credentials';
import SignInCustomerService from './sign-in-customer-service';

describe('SignInCustomerService', () => {
    let customerActionCreator: CustomerActionCreator;
    let remoteCheckoutActionCreator: RemoteCheckoutActionCreator;
    let store: CheckoutStore;

    beforeEach(() => {
        customerActionCreator = new CustomerActionCreator(createCheckoutClient());
        remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(
            new RemoteCheckoutRequestSender(createRequestSender())
        );
        store = createCheckoutStore();
    });

    it('dispatches action to sign in customer', async () => {
        const service = new SignInCustomerService(store, customerActionCreator, remoteCheckoutActionCreator);
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
        const service = new SignInCustomerService(store, customerActionCreator, remoteCheckoutActionCreator);
        const options = {};
        const action = Observable.of(createAction(actionTypes.SIGN_IN_CUSTOMER_REQUESTED));

        jest.spyOn(customerActionCreator, 'signOutCustomer').mockReturnValue(action);
        jest.spyOn(store, 'dispatch');

        const output = await service.signOut(options);

        expect(customerActionCreator.signOutCustomer).toHaveBeenCalledWith(options);
        expect(store.dispatch).toHaveBeenCalledWith(action);
        expect(output).toEqual(store.getState());
    });

    it('dispatches action to sign out as remote customer', async () => {
        const service = new SignInCustomerService(store, customerActionCreator, remoteCheckoutActionCreator);
        const options = {};
        const action = Observable.of(createAction(remoteCheckoutActionTypes.SIGN_OUT_REMOTE_CUSTOMER_REQUESTED));

        jest.spyOn(remoteCheckoutActionCreator, 'signOut').mockReturnValue(action);
        jest.spyOn(store, 'dispatch');

        const output = await service.remoteSignOut('amazon', options);

        expect(remoteCheckoutActionCreator.signOut).toHaveBeenCalledWith('amazon', options);
        expect(store.dispatch).toHaveBeenCalledWith(action);
        expect(output).toEqual(store.getState());
    });
});
