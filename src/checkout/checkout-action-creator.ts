import { createAction, createErrorAction } from '@bigcommerce/data-store';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { RequestOptions } from '../common/http-request';

import { CheckoutAction, CheckoutActionType } from './checkout-actions';
import CheckoutClient from './checkout-client';

export default class CheckoutActionCreator {
    constructor(
        private _checkoutClient: CheckoutClient
    ) {}

    loadCheckout(id: string, options?: RequestOptions): Observable<CheckoutAction> {
        return Observable.create((observer: Observer<CheckoutAction>) => {
            observer.next(createAction(CheckoutActionType.LoadCheckoutRequested));

            this._checkoutClient.loadCheckout(id, options)
                .then(({ body }) => {
                    observer.next(createAction(CheckoutActionType.LoadCheckoutSucceeded, body));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(CheckoutActionType.LoadCheckoutFailed, response));
                });
        });
    }
}
