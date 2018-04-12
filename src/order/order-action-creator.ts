import { createAction, createErrorAction, Action } from '@bigcommerce/data-store';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { CartComparator, InternalCart } from '../cart';
import { CartChangedError } from '../cart/errors';
import { CheckoutClient } from '../checkout';
import { RequestOptions } from '../common/http-request';

import * as actionTypes from './order-action-types';
import OrderRequestBody from './order-request-body';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class OrderActionCreator {
    private _cartComparator: CartComparator;

    constructor(
        private _checkoutClient: CheckoutClient
    ) {
        this._cartComparator = new CartComparator();
    }

    loadOrder(orderId: number, options?: RequestOptions): Observable<Action> {
        return Observable.create((observer: Observer<Action>) => {
            observer.next(createAction(actionTypes.LOAD_ORDER_REQUESTED));

            this._checkoutClient.loadOrder(orderId, options)
                .then(({ body = {} }) => {
                    observer.next(createAction(actionTypes.LOAD_ORDER_SUCCEEDED, body.data));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.LOAD_ORDER_FAILED, response));
                });
        });
    }

    submitOrder(payload: OrderRequestBody, cart?: InternalCart, options?: RequestOptions): Observable<Action> {
        return Observable.create((observer: Observer<Action>) => {
            observer.next(createAction(actionTypes.SUBMIT_ORDER_REQUESTED));

            this._verifyCart(cart, options)
                .then(() => this._checkoutClient.submitOrder(payload, options))
                .then(({ body = {}, headers = {} }) => {
                    observer.next(createAction(actionTypes.SUBMIT_ORDER_SUCCEEDED, body.data, { ...body.meta, token: headers.token }));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.SUBMIT_ORDER_FAILED, response));
                });
        });
    }

    finalizeOrder(orderId: number, options?: RequestOptions): Observable<Action> {
        return Observable.create((observer: Observer<Action>) => {
            observer.next(createAction(actionTypes.FINALIZE_ORDER_REQUESTED));

            this._checkoutClient.finalizeOrder(orderId, options)
                .then(({ body = {} }) => {
                    observer.next(createAction(actionTypes.FINALIZE_ORDER_SUCCEEDED, body.data));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.FINALIZE_ORDER_FAILED, response));
                });
        });
    }

    private _verifyCart(existingCart?: InternalCart, options?: RequestOptions): Promise<boolean> {
        if (!existingCart) {
            return Promise.resolve(true);
        }

        return this._checkoutClient.loadCart(options)
            .then(({ body = {} }) =>
                this._cartComparator.isEqual(existingCart, body.data.cart) ? Promise.resolve(true) : Promise.reject(false)
            )
            .catch(() => Promise.reject(new CartChangedError()));
    }
}
