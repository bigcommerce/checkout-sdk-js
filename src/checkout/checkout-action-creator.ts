import { createAction, createErrorAction } from '@bigcommerce/data-store';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { RequestOptions } from '../common/http-request';

import { CheckoutAction, CheckoutActionType } from './checkout-actions';
import CheckoutRequestSender from './checkout-request-sender';

export default class CheckoutActionCreator {
    constructor(
        private _checkoutRequestSender: CheckoutRequestSender
    ) {}

    loadCheckout(id: string, options?: RequestOptions): Observable<CheckoutAction> {
        return Observable.create((observer: Observer<CheckoutAction>) => {
            observer.next(createAction(CheckoutActionType.LoadCheckoutRequested));

            this._checkoutRequestSender.loadCheckout(id, options)
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
