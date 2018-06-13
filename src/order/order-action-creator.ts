import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';
import { concat } from 'rxjs/observable/concat';
import { defer } from 'rxjs/observable/defer';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { CheckoutClient, CheckoutValidator, InternalCheckoutSelectors } from '../checkout';
import { MissingDataError } from '../common/error/errors';
import { RequestOptions } from '../common/http-request';

import InternalOrderRequestBody from './internal-order-request-body';
import { FinalizeOrderAction, LoadOrderAction, OrderActionType, SubmitOrderAction } from './order-actions';
import OrderRequestBody from './order-request-body';

export default class OrderActionCreator {
    constructor(
        private _checkoutClient: CheckoutClient,
        private _checkoutValidator: CheckoutValidator
    ) {}

    loadOrder(orderId: number, options?: RequestOptions): Observable<LoadOrderAction> {
        return new Observable((observer: Observer<LoadOrderAction>) => {
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

    loadCurrentOrder(options?: RequestOptions): ThunkAction<LoadOrderAction, InternalCheckoutSelectors> {
        return store => defer(() => {
            const state = store.getState();
            const order = state.order.getOrder();
            const checkout = state.checkout.getCheckout();
            const orderId = (order && order.orderId) || (checkout && checkout.orderId);

            if (!orderId) {
                throw new MissingDataError('Unable to reload order data because "orderId" is missing');
            }

            return this.loadOrder(orderId, options);
        });
    }

    submitOrder(payload: OrderRequestBody, options?: RequestOptions): ThunkAction<SubmitOrderAction | LoadOrderAction, InternalCheckoutSelectors> {
        return store => concat(
            new Observable((observer: Observer<SubmitOrderAction>) => {
                observer.next(createAction(OrderActionType.SubmitOrderRequested));

                const state = store.getState();
                const checkout = state.checkout.getCheckout();

                this._checkoutValidator.validate(checkout, options)
                    .then(() => this._checkoutClient.submitOrder(this._mapToOrderRequestBody(payload), options))
                    .then(response => {
                        observer.next(createAction(OrderActionType.SubmitOrderSucceeded, response.body.data, { ...response.body.meta, token: response.headers.token }));
                        observer.complete();
                    })
                    .catch(response => {
                        observer.error(createErrorAction(OrderActionType.SubmitOrderFailed, response));
                    });
            }),
            // TODO: Remove once we can submit orders using storefront API
            this.loadCurrentOrder(options)(store)
        );
    }

    finalizeOrder(orderId: number, options?: RequestOptions): Observable<FinalizeOrderAction | LoadOrderAction> {
        return concat(
            new Observable((observer: Observer<FinalizeOrderAction>) => {
                observer.next(createAction(OrderActionType.FinalizeOrderRequested));

                this._checkoutClient.finalizeOrder(orderId, options)
                    .then(response => {
                        observer.next(createAction(OrderActionType.FinalizeOrderSucceeded, response.body.data));
                        observer.complete();
                    })
                    .catch(response => {
                        observer.error(createErrorAction(OrderActionType.FinalizeOrderFailed, response));
                    });
            }),
            // TODO: Remove once we can submit orders using storefront API
            this.loadOrder(orderId, options)
        );
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
