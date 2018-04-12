import { createAction, createErrorAction, Action } from '@bigcommerce/data-store';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { CheckoutClient } from '../checkout';
import { RequestOptions } from '../common/http-request';

import * as actionTypes from './quote-action-types';

/**
 * @todo Convert this file into TypeScript properly
 * i.e.: Action<T>
 */
export default class QuoteActionCreator {
    constructor(
        private _checkoutClient: CheckoutClient
    ) {}

    loadQuote(options?: RequestOptions): Observable<Action> {
        return Observable.create((observer: Observer<Action>) => {
            observer.next(createAction(actionTypes.LOAD_QUOTE_REQUESTED));

            this._checkoutClient.loadQuote(options)
                .then(({ body = {} }) => {
                    observer.next(createAction(actionTypes.LOAD_QUOTE_SUCCEEDED, body.data, body.meta));
                    observer.complete();
                })
                .catch((response) => {
                    observer.error(createErrorAction(actionTypes.LOAD_QUOTE_FAILED, response));
                });
        });
    }
}
