import { createAction, createErrorAction } from '@bigcommerce/data-store';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { Cart, CartRequestSender } from '../cart';
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
                .then(({ body: [cart] }: { body: Cart[] }) => {
                    if (!cart) {
                        throw new CartUnavailableError();
                    }

                    return cart.id;
                })
                .then((id: string) => this._checkoutRequestSender.loadCheckout(id, options))
                .then(({ body }: { body: Checkout }) => {
                    observer.next(createAction(CheckoutActionType.LoadCheckoutSucceeded, body));
                    observer.complete();
                })
                .catch((response: any) => {
                    observer.error(createErrorAction(CheckoutActionType.LoadCheckoutFailed, response));
                });
        });
    }
}
