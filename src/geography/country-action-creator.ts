import { createAction, createErrorAction, Action } from '@bigcommerce/data-store';
import { Observable, Observer } from 'rxjs';

import { RequestOptions } from '../common/http-request';

import Country from './country';
import { CountryActionType } from './country-actions';
import CountryRequestSender from './country-request-sender';

export default class CountryActionCreator {
    constructor(
        private _countryRequestSender: CountryRequestSender
    ) {}

    loadCountries(options?: RequestOptions): Observable<Action<Country[]>> {
        return Observable.create((observer: Observer<Action<Country[]>>) => {
            observer.next(createAction(CountryActionType.LoadCountriesRequested));

            this._countryRequestSender.loadCountries(options)
                .then(response => {
                    observer.next(createAction(CountryActionType.LoadCountriesSucceeded, response.body.data));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(CountryActionType.LoadCountriesFailed, response));
                });
        });
    }
}
