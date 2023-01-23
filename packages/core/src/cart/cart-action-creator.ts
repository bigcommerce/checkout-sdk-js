import { createAction } from '@bigcommerce/data-store';
import { concat, from, Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { CheckoutActionCreator } from '../checkout';
import { throwErrorAction } from '../common/error';
import { RequestOptions } from '../common/http-request';

import BuyNowCartRequestBody from './buy-now-cart-request-body';
import { CartAction, CartActionType } from './cart-actions';
import CartRequestSender from './cart-request-sender';

export default class CartActionCreator {
    constructor(
        private _cartRequestSender: CartRequestSender,
        private _checkoutActionCreator: CheckoutActionCreator,
    ) {}

    createBuyNowCart(
        body: BuyNowCartRequestBody,
        options?: RequestOptions,
    ): Observable<CartAction> {
        return concat(
            of(createAction(CartActionType.CreateBuyNowCartRequested)),
            from(this._cartRequestSender.createBuyNowCart(body, options)).pipe(
                switchMap(({ body: buyNowCart }) =>
                    concat(
                        this._checkoutActionCreator.loadCheckout(buyNowCart.id),
                        of(createAction(CartActionType.CreateBuyNowCartSucceeded, buyNowCart)),
                    ),
                ),
            ),
        ).pipe(
            catchError((error) => throwErrorAction(CartActionType.CreateBuyNowCartFailed, error)),
        );
    }
}
