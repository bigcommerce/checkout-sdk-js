import { Observable } from 'rxjs/Observable';
import { createAction, createErrorAction } from '@bigcommerce/data-store';
import * as actionTypes from './billing-address-action-types';

export default class BillingAddressActionCreator {
    /**
     * @constructor
     * @param {CheckoutClient} checkoutClient
     */
    constructor(checkoutClient) {
        this._checkoutClient = checkoutClient;
    }

    /**
     * @param {Address} address
     * @param {RequestOptions} [options]
     * @return {Observable<Action>}
     */
    updateAddress(address, options) {
        return Observable.create((observer) => {
            observer.next(createAction(actionTypes.UPDATE_BILLING_ADDRESS_REQUESTED));

            this._checkoutClient.updateBillingAddress(address, options)
                .then(({ body: { data } = {} }) => {
                    observer.next(createAction(actionTypes.UPDATE_BILLING_ADDRESS_SUCCEEDED, data));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.UPDATE_BILLING_ADDRESS_FAILED, response));
                });
        });
    }
}
