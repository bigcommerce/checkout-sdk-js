import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { CheckoutClient, CheckoutValidator, InternalCheckoutSelectors } from '../checkout';
import { RequestOptions } from '../common/http-request';

import InternalOrderRequestBody from './internal-order-request-body';
import { FinalizeOrderAction, LoadOrderAction, OrderActionType, SubmitOrderAction } from './order-actions';
import OrderRequestBody from './order-request-body';

export default class OrderActionCreator {
    constructor(
        private _checkoutClient: CheckoutClient,
        private _checkoutValidator: CheckoutValidator
    ) { }

    loadOrder(orderId: number, options?: RequestOptions): Observable<LoadOrderAction> {
        return Observable.create((observer: Observer<LoadOrderAction>) => {
            observer.next(createAction(OrderActionType.LoadOrderRequested));

            this._checkoutClient.loadOrder(orderId, options)
                .then(response => {
                    observer.next(createAction(OrderActionType.LoadOrderSucceeded, response.body));
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

            this._checkoutValidator.validate(cart, options)
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

    private _mapToOrderRequestBody(payload: OrderRequestBody): InternalOrderRequestBody {
        const { payment, ...order } = payload;

        if (!payment) {
            return order;
        }

        return {
            ...payload,
            payment: {
                paymentData: payment.paymentData,
                name: payment.methodId,
                gateway: payment.gatewayId,
            },
        };
    }
}
