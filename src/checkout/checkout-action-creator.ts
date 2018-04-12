import { createAction, createErrorAction } from '@bigcommerce/data-store';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { CartRequestSender } from '../cart';

import { CheckoutAction, CheckoutActionType } from './checkout-actions';
import CheckoutClient from './checkout-client';

export default class CheckoutActionCreator {
    constructor(
        private _checkoutClient: CheckoutClient,
        private _cartRequestSender: CartRequestSender
    ) {}

    loadCheckout(id: string, options?: any): Observable<CheckoutAction> {
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
