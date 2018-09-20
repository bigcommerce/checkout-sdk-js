import { createAction, createErrorAction, Action } from '@bigcommerce/data-store';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { RequestOptions } from '../common/http-request';

import * as actionTypes from './shipping-country-action-types';
import ShippingCountryRequestSender from './shipping-country-request-sender';

/**
 * @todo Convert this file into TypeScript properly
 * i.e.: Action<T>
 */
export default class ShippingCountryActionCreator {
    constructor(
        private _shippingCountryRequestSender: ShippingCountryRequestSender
    ) {}

    loadCountries(options?: RequestOptions): Observable<Action> {
        return Observable.create((observer: Observer<Action>) => {
            observer.next(createAction(actionTypes.LOAD_SHIPPING_COUNTRIES_REQUESTED));

            this._shippingCountryRequestSender.loadCountries(options)
                .then(response => {
                    observer.next(createAction(actionTypes.LOAD_SHIPPING_COUNTRIES_SUCCEEDED, response.body.data));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.LOAD_SHIPPING_COUNTRIES_FAILED, response));
                });
        });
    }
}
