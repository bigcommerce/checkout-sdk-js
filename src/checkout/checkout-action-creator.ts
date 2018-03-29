import { createAction, createErrorAction, Action } from '@bigcommerce/data-store';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { CartRequestSender } from '../cart';
import { CartUnavailableError } from '../cart/errors';

import Checkout from './checkout';
import { CheckoutAction, CheckoutActionType } from './checkout-actions';
import CheckoutRequestSender from './checkout-request-sender';

export default class CheckoutActionCreator {
    constructor(
        private _checkoutRequestSender: CheckoutRequestSender,
        private _cartRequestSender: CartRequestSender
    ) {}

    loadCheckout(options?: any): Observable<CheckoutAction> {
        return Observable.create((observer: Observer<CheckoutAction>) => {
            observer.next(createAction(CheckoutActionType.LoadCheckoutRequested));

            this._cartRequestSender.loadCarts(options)
                .then(({ body: [cart] }) => {
                    if (!cart) {
                        throw new CartUnavailableError();
                    }

                    return cart.id;
                })
                .then((id) => this._checkoutRequestSender.loadCheckout(id, options))
                .then(({ body }) => {
                    observer.next(createAction(CheckoutActionType.LoadCheckoutSucceeded, body));
                    observer.complete();
                })
                .catch((response) => {
                    observer.error(createErrorAction(CheckoutActionType.LoadCheckoutFailed, response));
                });
        });
    }
}
