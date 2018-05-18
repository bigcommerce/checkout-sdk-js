import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { CartComparator, InternalCart } from '../cart';
import { CartChangedError } from '../cart/errors';
import { CheckoutClient, InternalCheckoutSelectors } from '../checkout';
import { MissingDataError } from '../common/error/errors';
import { RequestOptions } from '../common/http-request';

import { FinalizeOrderAction, LoadOrderAction, OrderActionType, SubmitOrderAction } from './order-actions';
import OrderRequestBody from './order-request-body';

export default class OrderActionCreator {
    private _cartComparator: CartComparator;

    constructor(
        private _checkoutClient: CheckoutClient
    ) {
        this._cartComparator = new CartComparator();
    }

    loadOrder(orderId: number, options?: RequestOptions): Observable<LoadOrderAction> {
        return Observable.create((observer: Observer<LoadOrderAction>) => {
            observer.next(createAction(OrderActionType.LoadOrderRequested));

            this._checkoutClient.loadOrder(orderId, options)
                .then(response => {
                    observer.next(createAction(OrderActionType.LoadOrderSucceeded, response.body.data));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(OrderActionType.LoadOrderFailed, response));
                });
        });
    }

    submitOrder(payload: OrderRequestBody, options?: RequestOptions): ThunkAction<SubmitOrderAction, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<SubmitOrderAction>) => {
            observer.next(createAction(OrderActionType.SubmitOrderRequested));

            const state = store.getState();
            const cart = state.cart.getCart();

            if (!cart) {
                throw new MissingDataError();
            }

            this._verifyCart(cart, options)
                .then(() => this._checkoutClient.submitOrder(this._mapToOrderRequestBody(payload), options))
                .then(response => {
                    observer.next(createAction(OrderActionType.SubmitOrderSucceeded, response.body.data, { ...response.body.meta, token: response.headers.token }));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(OrderActionType.SubmitOrderFailed, response));
                });
        });
    }

    finalizeOrder(orderId: number, options?: RequestOptions): Observable<FinalizeOrderAction> {
        return Observable.create((observer: Observer<FinalizeOrderAction>) => {
            observer.next(createAction(OrderActionType.FinalizeOrderRequested));

            this._checkoutClient.finalizeOrder(orderId, options)
                .then(response => {
                    observer.next(createAction(OrderActionType.FinalizeOrderSucceeded, response.body.data));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(OrderActionType.FinalizeOrderFailed, response));
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

    private _mapToOrderRequestBody(payload: OrderRequestBody): any {
        if (!payload.payment) {
            return payload;
        }

        return {
            ...payload,
            payment: {
                paymentData: payload.payment.paymentData,
                name: payload.payment.methodId,
                gateway: payload.payment.gatewayId,
            },
        };
    }
}
