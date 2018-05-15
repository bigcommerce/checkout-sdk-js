import { createAction, createErrorAction, Action, ThunkAction } from '@bigcommerce/data-store';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { CartComparator, InternalCart } from '../cart';
import { CartChangedError } from '../cart/errors';
import { CheckoutClient, InternalCheckoutSelectors } from '../checkout';
import { MissingDataError } from '../common/error/errors';
import { RequestOptions } from '../common/http-request';

import { InternalOrderResponseData } from './internal-order-responses';
import Order from './order';
import * as actionTypes from './order-action-types';
import OrderParams from './order-params';
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

    loadOrder(orderId: number, options?: RequestOptions<OrderParams>): Observable<Action<Order>> {
        return Observable.create((observer: Observer<Action<Order>>) => {
            observer.next(createAction(actionTypes.LOAD_ORDER_REQUESTED));

            this._checkoutClient.loadOrder(orderId, options)
                .then(response => {
                    observer.next(createAction(actionTypes.LOAD_ORDER_SUCCEEDED, response.body));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.LOAD_ORDER_FAILED, response));
                });
        });
    }

    /**
     * @deprecated
     * Remove once we fully transition to Storefront API
     */
    loadInternalOrder(orderId: number, options?: RequestOptions): Observable<Action> {
        return Observable.create((observer: Observer<Action>) => {
            observer.next(createAction(actionTypes.LOAD_INTERNAL_ORDER_REQUESTED));

            this._checkoutClient.loadInternalOrder(orderId, options)
                .then(({ body: { data } }) => {
                    observer.next(createAction(actionTypes.LOAD_INTERNAL_ORDER_SUCCEEDED, data));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.LOAD_INTERNAL_ORDER_FAILED, response));
                });
        });
    }

    submitOrder(payload: OrderRequestBody, options?: RequestOptions): ThunkAction<Action<InternalOrderResponseData>, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<Action<InternalOrderResponseData>>) => {
            observer.next(createAction(actionTypes.SUBMIT_ORDER_REQUESTED));

            const state = store.getState();
            const cart = state.cart.getCart();

            if (!cart) {
                throw new MissingDataError();
            }

            this._verifyCart(cart, options)
                .then(() => this._checkoutClient.submitOrder(payload, options))
                .then(response => {
                    observer.next(createAction(actionTypes.SUBMIT_ORDER_SUCCEEDED, response.body.data, { ...response.body.meta, token: response.headers.token }));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.SUBMIT_ORDER_FAILED, response));
                });
        });
    }

    finalizeOrder(orderId: number, options?: RequestOptions): Observable<Action<InternalOrderResponseData>> {
        return Observable.create((observer: Observer<Action<InternalOrderResponseData>>) => {
            observer.next(createAction(actionTypes.FINALIZE_ORDER_REQUESTED));

            this._checkoutClient.finalizeOrder(orderId, options)
                .then(response => {
                    observer.next(createAction(actionTypes.FINALIZE_ORDER_SUCCEEDED, response.body.data));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.FINALIZE_ORDER_FAILED, response));
                });
        });
    }

    private _verifyCart(existingCart: InternalCart, options?: RequestOptions): Promise<boolean> {
        return this._checkoutClient.loadCart(options)
            .then(({ body = {} }) =>
                this._cartComparator.isEqual(existingCart, body.data.cart) ? Promise.resolve(true) : Promise.reject(false)
            )
            .catch(() => Promise.reject(new CartChangedError()));
    }
}
