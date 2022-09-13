import { createAction } from '@bigcommerce/data-store';
import { concat, defer, of, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwErrorAction } from '../common/error';

import { RequestOptions } from '../common/http-request';
import { CartActionType } from './cart-actions';
import CartRequestBody from './cart-request-body';
import CartRequestSender from './cart-request-sender';

export default class CartActionCreator {
    constructor(
        private _cartRequestSender: CartRequestSender,
    ) {}

    createCart(
        cart: CartRequestBody,
        options?: RequestOptions
    ): Observable<any> {
        return concat(
            of(createAction(CartActionType.CreateCartRequested)),
            defer(async () => {
                const { body } = await this._cartRequestSender.createCart(cart, options);

                return createAction(CartActionType.CreateCartSucceeded, body);
            })
        ).pipe(
            catchError(error => throwErrorAction(CartActionType.CreateCartFailed, error))
        );
    }
}
