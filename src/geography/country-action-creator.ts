import { createAction, createErrorAction, Action } from '@bigcommerce/data-store';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { CheckoutClient } from '../checkout';
import { RequestOptions } from '../common/http-request';

import * as actionTypes from './country-action-types';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class CountryActionCreator {
    constructor(
        private _checkoutClient: CheckoutClient
    ) {}

    loadCountries(options?: RequestOptions): Observable<Action> {
        return Observable.create((observer: Observer<Action>) => {
            observer.next(createAction(actionTypes.LOAD_COUNTRIES_REQUESTED));

            this._checkoutClient.loadCountries(options)
                .then(({ body = {} }) => {
                    observer.next(createAction(actionTypes.LOAD_COUNTRIES_SUCCEEDED, body.data));
                    observer.complete();
                })
                .catch((response) => {
                    observer.error(createErrorAction(actionTypes.LOAD_COUNTRIES_FAILED, response));
                });
        });
    }
}
