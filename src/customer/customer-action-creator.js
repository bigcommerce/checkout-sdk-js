import { Observable } from 'rxjs/Observable';
import { createAction, createErrorAction } from '@bigcommerce/data-store';
import * as actionTypes from './customer-action-types';

export default class CustomerActionCreator {
    /**
     * @constructor
     * @param {CheckoutClient} checkoutClient
     */
    constructor(checkoutClient) {
        this._checkoutClient = checkoutClient;
    }

    /**
     * @param {CustomerCredentials} credentials
     * @param {RequestOptions} [options]
     * @return {Observable<Action>}
     */
    signInCustomer(credentials, options) {
        return Observable.create((observer) => {
            observer.next(createAction(actionTypes.SIGN_IN_CUSTOMER_REQUESTED));

            this._checkoutClient.signInCustomer(credentials, options)
                .then(({ body: { data } = {} }) => {
                    observer.next(createAction(actionTypes.SIGN_IN_CUSTOMER_SUCCEEDED, data));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.SIGN_IN_CUSTOMER_FAILED, response));
                });
        });
    }

    /**
     * @param {RequestOptions} [options]
     * @return {Observable<Action>}
     */
    signOutCustomer(options) {
        return Observable.create((observer) => {
            observer.next(createAction(actionTypes.SIGN_OUT_CUSTOMER_REQUESTED));

            this._checkoutClient.signOutCustomer(options)
                .then(({ body: { data } = {} }) => {
                    observer.next(createAction(actionTypes.SIGN_OUT_CUSTOMER_SUCCEEDED, data));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.SIGN_OUT_CUSTOMER_FAILED, response));
                });
        });
    }
}
