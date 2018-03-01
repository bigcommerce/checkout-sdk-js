import { Observable } from 'rxjs/Observable';
import { createAction, createErrorAction } from '@bigcommerce/data-store';
import * as actionTypes from './shipping-country-action-types';

export default class ShippingCountryActionCreator {
    /**
     * @constructor
     * @param {CheckoutClient} checkoutClient
     */
    constructor(checkoutClient) {
        this._checkoutClient = checkoutClient;
    }

    /**
     * @param {RequestOptions} [options]
     * @return {Observable<Action>}
     */
    loadCountries(options) {
        return Observable.create((observer) => {
            observer.next(createAction(actionTypes.LOAD_SHIPPING_COUNTRIES_REQUESTED));

            this._checkoutClient.loadShippingCountries(options)
                .then(({ body: { data } = {} }) => {
                    observer.next(createAction(actionTypes.LOAD_SHIPPING_COUNTRIES_SUCCEEDED, data));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.LOAD_SHIPPING_COUNTRIES_FAILED, response));
                });
        });
    }
}
