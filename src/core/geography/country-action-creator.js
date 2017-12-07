import { Observable } from 'rxjs/Observable';
import { createAction, createErrorAction } from '../../data-store';
import * as actionTypes from './country-action-types';

export default class CountryActionCreator {
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
            observer.next(createAction(actionTypes.LOAD_COUNTRIES_REQUESTED));

            this._checkoutClient.loadCountries(options)
                .then(({ body: { data } = {} }) => {
                    observer.next(createAction(actionTypes.LOAD_COUNTRIES_SUCCEEDED, data));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.LOAD_COUNTRIES_FAILED, response));
                });
        });
    }
}
