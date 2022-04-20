import { createAction, createErrorAction } from '@bigcommerce/data-store';
import { Observable, Observer } from 'rxjs';

import { RequestOptions } from '../common/http-request';

import { LoadShippingCountriesAction, ShippingCountryActionType } from './shipping-country-actions';
import ShippingCountryRequestSender from './shipping-country-request-sender';

export default class ShippingCountryActionCreator {
    constructor(
        private _shippingCountryRequestSender: ShippingCountryRequestSender
    ) {}

    loadCountries(options?: RequestOptions): Observable<LoadShippingCountriesAction> {
        return Observable.create((observer: Observer<LoadShippingCountriesAction>) => {
            observer.next(createAction(ShippingCountryActionType.LoadShippingCountriesRequested));

            this._shippingCountryRequestSender.loadCountries(options)
                .then(response => {
                    observer.next(createAction(ShippingCountryActionType.LoadShippingCountriesSucceeded, response.body.data));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(ShippingCountryActionType.LoadShippingCountriesFailed, response));
                });
        });
    }
}
