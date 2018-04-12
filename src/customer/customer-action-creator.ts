import { createAction, createErrorAction, Action } from '@bigcommerce/data-store';
import { RequestOptions } from '@bigcommerce/request-sender';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { CheckoutClient } from '../checkout';

import * as actionTypes from './customer-action-types';
import CustomerCredentials from './customer-credentials';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class CustomerActionCreator {
    constructor(
        private _checkoutClient: CheckoutClient
    ) {}

    signInCustomer(credentials: CustomerCredentials, options?: RequestOptions): Observable<Action> {
        return Observable.create((observer: Observer<Action>) => {
            observer.next(createAction(actionTypes.SIGN_IN_CUSTOMER_REQUESTED));

            this._checkoutClient.signInCustomer(credentials, options)
                .then(({ body = {} }) => {
                    observer.next(createAction(actionTypes.SIGN_IN_CUSTOMER_SUCCEEDED, body.data));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.SIGN_IN_CUSTOMER_FAILED, response));
                });
        });
    }

    signOutCustomer(options?: RequestOptions): Observable<Action> {
        return Observable.create((observer: Observer<Action>) => {
            observer.next(createAction(actionTypes.SIGN_OUT_CUSTOMER_REQUESTED));

            this._checkoutClient.signOutCustomer(options)
                .then(({ body = {} }) => {
                    observer.next(createAction(actionTypes.SIGN_OUT_CUSTOMER_SUCCEEDED, body.data));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.SIGN_OUT_CUSTOMER_FAILED, response));
                });
        });
    }
}
