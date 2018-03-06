import { Observable } from 'rxjs/Observable';
import { createAction, createErrorAction } from '@bigcommerce/data-store';
import * as actionTypes from './quote-action-types';

export default class QuoteActionCreator {
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
    loadQuote(options) {
        return Observable.create((observer) => {
            observer.next(createAction(actionTypes.LOAD_QUOTE_REQUESTED));

            this._checkoutClient.loadCheckout(options)
                .then(({ body: { data, meta } = {} }) => {
                    observer.next(createAction(actionTypes.LOAD_QUOTE_SUCCEEDED, data, meta));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.LOAD_QUOTE_FAILED, response));
                });
        });
    }
}
