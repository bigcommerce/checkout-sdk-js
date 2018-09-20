import { createAction, createErrorAction, Action } from '@bigcommerce/data-store';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { RequestOptions } from '../common/http-request';

import Country from './country';
import * as actionTypes from './country-action-types';
import CountryRequestSender from './country-request-sender';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class CountryActionCreator {
    constructor(
        private _countryRequestSender: CountryRequestSender
    ) {}

    loadCountries(options?: RequestOptions): Observable<Action<Country[]>> {
        return Observable.create((observer: Observer<Action<Country[]>>) => {
            observer.next(createAction(actionTypes.LOAD_COUNTRIES_REQUESTED));

            this._countryRequestSender.loadCountries(options)
                .then(response => {
                    observer.next(createAction(actionTypes.LOAD_COUNTRIES_SUCCEEDED, response.body.data));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.LOAD_COUNTRIES_FAILED, response));
                });
        });
    }
}
