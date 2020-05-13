import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';
import { concat, defer, from, of, Observable, Observer } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { CheckoutValidator, InternalCheckoutSelectors } from '../checkout';
import { throwErrorAction } from '../common/error';
import { MissingDataError, MissingDataErrorType } from '../common/error/errors';
import { RequestOptions } from '../common/http-request';
import { SpamProtectionNotCompletedError } from '../spam-protection/errors';

import InternalOrderRequestBody from './internal-order-request-body';
import { FinalizeOrderAction, LoadOrderAction, LoadOrderPaymentsAction, OrderActionType, SubmitOrderAction } from './order-actions';
import OrderRequestBody from './order-request-body';
import OrderRequestSender from './order-request-sender';

export default class OrderActionCreator {
    constructor(
        private _orderRequestSender: OrderRequestSender,
        private _checkoutValidator: CheckoutValidator
    ) {}

    loadOrder(orderId: number, options?: RequestOptions): Observable<LoadOrderAction> {
        return new Observable((observer: Observer<LoadOrderAction>) => {
            observer.next(createAction(OrderActionType.LoadOrderRequested));

            this._orderRequestSender.loadOrder(orderId, options)
                .then(response => {
                    observer.next(createAction(OrderActionType.LoadOrderSucceeded, response.body));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(OrderActionType.LoadOrderFailed, response));
                });
        });
    }

    // TODO: Remove when checkout does not contain unrelated order data.
    loadOrderPayments(orderId: number, options?: RequestOptions): Observable<LoadOrderPaymentsAction> {
        return new Observable((observer: Observer<LoadOrderPaymentsAction>) => {
            observer.next(createAction(OrderActionType.LoadOrderPaymentsRequested));

            this._orderRequestSender.loadOrder(orderId, options)
                .then(response => {
                    observer.next(createAction(OrderActionType.LoadOrderPaymentsSucceeded, response.body));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(OrderActionType.LoadOrderPaymentsFailed, response));
                });
        });
    }

    loadCurrentOrder(options?: RequestOptions): ThunkAction<LoadOrderAction, InternalCheckoutSelectors> {
        return store => defer(() => {
            const orderId = this._getCurrentOrderId(store.getState());

            if (!orderId) {
                throw new MissingDataError(MissingDataErrorType.MissingOrderId);
            }

            return this.loadOrder(orderId, options);
        });
    }

    submitOrder(payload: OrderRequestBody, options?: RequestOptions): ThunkAction<SubmitOrderAction, InternalCheckoutSelectors> {
        return store => concat(
            of(createAction(OrderActionType.SubmitOrderRequested)),
            defer(() => {
                const state = store.getState();
                const externalSource = state.config.getExternalSource();
                const variantIdentificationToken = state.config.getVariantIdentificationToken();
                const checkout = state.checkout.getCheckout();

                if (!checkout) {
                    throw new MissingDataError(MissingDataErrorType.MissingCheckout);
                }

                if (checkout.shouldExecuteSpamCheck) {
                    throw new SpamProtectionNotCompletedError();
                }

                return from(
                    this._checkoutValidator.validate(checkout, options)
                        .then(() => this._orderRequestSender.submitOrder(
                            this._mapToOrderRequestBody(
                                payload,
                                checkout.customerMessage,
                                externalSource
                            ),
                            {
                                ...options,
                                headers: {
                                    checkoutVariant: variantIdentificationToken,
                                },
                            }))
                ).pipe(
                    switchMap(response => concat(
                        // TODO: Remove once we can submit orders using storefront API
                        this.loadOrder(response.body.data.order.orderId, options),
                        of(createAction(OrderActionType.SubmitOrderSucceeded, response.body.data, { ...response.body.meta, token: response.headers.token }))
                    ))
                );
            }).pipe(
                catchError(error => throwErrorAction(OrderActionType.SubmitOrderFailed, error))
            )
        );
    }

    finalizeOrder(orderId: number, options?: RequestOptions): Observable<FinalizeOrderAction | LoadOrderAction> {
        return concat(
            of(createAction(OrderActionType.FinalizeOrderRequested)),
            from(this._orderRequestSender.finalizeOrder(orderId, options))
                .pipe(
                    switchMap(response => concat(
                        this.loadOrder(orderId, options),
                        of(createAction(OrderActionType.FinalizeOrderSucceeded, response.body.data))
                    ))
                )
        ).pipe(
            catchError(error => throwErrorAction(OrderActionType.FinalizeOrderFailed, error))
        );
    }

    private _getCurrentOrderId(state: InternalCheckoutSelectors): number | undefined {
        const order = state.order.getOrder();
        const checkout = state.checkout.getCheckout();

        return (order && order.orderId) || (checkout && checkout.orderId);
    }

    private _mapToOrderRequestBody(
        payload: OrderRequestBody,
        customerMessage: string,
        externalSource?: string
    ): InternalOrderRequestBody {
        const { payment, ...order } = payload;

        if (!payment) {
            return {
                ...order,
                customerMessage,
                externalSource,
            };
        }

        return {
            ...order,
            customerMessage,
            externalSource,
            payment: {
                paymentData: payment.paymentData,
                name: payment.methodId,
                gateway: payment.gatewayId,
            },
        };
    }
}
