import { createAction, createErrorAction, Action } from '@bigcommerce/data-store';
import { RequestOptions } from '@bigcommerce/request-sender';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { CheckoutClient } from '../checkout';

import { CustomerActionType, SignInCustomerAction, SignOutCustomerAction } from './customer-actions';
import CustomerCredentials from './customer-credentials';

export default class CustomerActionCreator {
    constructor(
        private _checkoutClient: CheckoutClient
    ) {}

    signInCustomer(credentials: CustomerCredentials, options?: RequestOptions): Observable<SignInCustomerAction> {
        return Observable.create((observer: Observer<Action>) => {
            observer.next(createAction(CustomerActionType.SignInCustomerRequested));

            this._checkoutClient.signInCustomer(credentials, options)
                .then(({ body = {} }) => {
                    observer.next(createAction(CustomerActionType.SignInCustomerSucceeded, body.data));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(CustomerActionType.SignInCustomerFailed, response));
                });
        });
    }

    signOutCustomer(options?: RequestOptions): Observable<SignOutCustomerAction> {
        return Observable.create((observer: Observer<SignOutCustomerAction>) => {
            observer.next(createAction(CustomerActionType.SignOutCustomerRequested));

            this._checkoutClient.signOutCustomer(options)
                .then(({ body = {} }) => {
                    observer.next(createAction(CustomerActionType.SignOutCustomerSucceeded, body.data));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(CustomerActionType.SignOutCustomerFailed, response));
                });
        });
    }
}
