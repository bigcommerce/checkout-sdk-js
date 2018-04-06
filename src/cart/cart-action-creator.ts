import { createAction, createErrorAction, Action } from '@bigcommerce/data-store';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { CheckoutClient } from '../checkout';
import { RequestOptions } from '../common/http-request';

import * as actionTypes from './cart-action-types';
import CartComparator from './cart-comparator';
import InternalCart from './internal-cart';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class CartActionCreator {
    constructor(
        private _checkoutClient: CheckoutClient
    ) {}

    loadCart(options?: RequestOptions): Observable<Action> {
        return Observable.create((observer: Observer<Action>) => {
            observer.next(createAction(actionTypes.LOAD_CART_REQUESTED));

            this._checkoutClient.loadCart(options)
                .then(({ body = {} }) => {
                    observer.next(createAction(actionTypes.LOAD_CART_SUCCEEDED, body.data, body.meta));
                    observer.complete();
                })
                .catch((response) => {
                    observer.error(createErrorAction(actionTypes.LOAD_CART_FAILED, response));
                });
        });
    }

    /**
     * @deprecated
     */
    verifyCart(cart?: InternalCart, options?: RequestOptions): Observable<Action> {
        return Observable.create((observer: Observer<Action>) => {
            observer.next(createAction(actionTypes.VERIFY_CART_REQUESTED));

            this._checkoutClient.loadCart(options)
                .then(({ body = {} }) => {
                    const comparator = new CartComparator();
                    const isValid = cart ? comparator.isEqual(cart, body.data.cart) : false;

                    observer.next(createAction(actionTypes.VERIFY_CART_SUCCEEDED, isValid));
                    observer.complete();
                })
                .catch((response) => {
                    observer.error(createErrorAction(actionTypes.VERIFY_CART_FAILED, response));
                });
        });
    }
}
