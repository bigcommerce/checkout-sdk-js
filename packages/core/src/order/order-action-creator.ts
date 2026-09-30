import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';
import { concat, defer, from, Observable, Observer, of, Subject } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { CheckoutValidator, InternalCheckoutSelectors } from '../checkout';
import { throwErrorAction } from '../common/error';
import { MissingDataError, MissingDataErrorType } from '../common/error/errors';
import { RequestOptions } from '../common/http-request';
import { SpamProtectionNotCompletedError } from '../spam-protection/errors';

import InternalOrderRequestBody from './internal-order-request-body';
import {
    FinalizeOrderAction,
    LoadOrderAction,
    LoadOrderPaymentsAction,
    OrderActionType,
    SubmitOrderAction,
} from './order-actions';
import OrderRequestBody from './order-request-body';
import OrderRequestSender from './order-request-sender';

export const RETURN_FULL_ORDER_DETAILS_ON_CREATE_ORDER =
    'PROJECT-8987.return_full_order_details_on_create_order';

export default class OrderActionCreator {
    private _orderCreated$ = new Subject<number>();

    constructor(
        private _orderRequestSender: OrderRequestSender,
        private _checkoutValidator: CheckoutValidator,
    ) {}

    // Emits once `submitOrder` has created and refetched the order, before payment is submitted.
    get orderCreated$(): Observable<number> {
        return this._orderCreated$.asObservable();
    }

    loadOrder(orderId: number, options?: RequestOptions): Observable<LoadOrderAction> {
        return new Observable((observer: Observer<LoadOrderAction>) => {
            observer.next(createAction(OrderActionType.LoadOrderRequested));

            this._orderRequestSender
                .loadOrder(orderId, options)
                .then((response) => {
                    observer.next(createAction(OrderActionType.LoadOrderSucceeded, response.body));
                    observer.complete();
                })
                .catch((response) => {
                    observer.error(createErrorAction(OrderActionType.LoadOrderFailed, response));
                });
        });
    }

    // TODO: Remove when checkout does not contain unrelated order data.
    loadOrderPayments(
        orderId: number,
        options?: RequestOptions,
    ): Observable<LoadOrderPaymentsAction> {
        return new Observable((observer: Observer<LoadOrderPaymentsAction>) => {
            observer.next(createAction(OrderActionType.LoadOrderPaymentsRequested));

            this._orderRequestSender
                .loadOrder(orderId, options)
                .then((response) => {
                    observer.next(
                        createAction(OrderActionType.LoadOrderPaymentsSucceeded, response.body),
                    );
                    observer.complete();
                })
                .catch((response) => {
                    observer.error(
                        createErrorAction(OrderActionType.LoadOrderPaymentsFailed, response),
                    );
                });
        });
    }

    loadCurrentOrder(
        options?: RequestOptions,
    ): ThunkAction<LoadOrderAction, InternalCheckoutSelectors> {
        return (store) =>
            defer(() => {
                const orderId = this._getCurrentOrderId(store.getState());

                if (!orderId) {
                    throw new MissingDataError(MissingDataErrorType.MissingOrderId);
                }

                return this.loadOrder(orderId, options);
            });
    }

    submitOrder(
        payload?: OrderRequestBody,
        options?: RequestOptions,
    ): ThunkAction<SubmitOrderAction, InternalCheckoutSelectors> {
        return (store) =>
            concat(
                of(createAction(OrderActionType.SubmitOrderRequested)),
                defer(() => {
                    const state = store.getState();
                    const externalSource = state.config.getExternalSource();
                    const variantIdentificationToken = state.config.getVariantIdentificationToken();
                    const checkout = state.checkout.getCheckout();
                    const includeOrderDetails = this._isReturnFullOrderDetailsEnabled(state);

                    if (!checkout) {
                        throw new MissingDataError(MissingDataErrorType.MissingCheckout);
                    }

                    if (checkout.shouldExecuteSpamCheck) {
                        throw new SpamProtectionNotCompletedError();
                    }

                    return from(
                        this._checkoutValidator.validate(checkout, options).then(() =>
                            this._orderRequestSender.submitOrder(
                                this._mapToOrderRequestBody(
                                    payload ?? {},
                                    checkout.id,
                                    checkout.customerMessage,
                                    externalSource,
                                ),
                                {
                                    ...options,
                                    headers: {
                                        checkoutVariant: variantIdentificationToken,
                                    },
                                    includeOrderDetails,
                                },
                            ),
                        ),
                    ).pipe(
                        switchMap((response) => {
                            const orderId = response.body.data.order.orderId;
                            const { orderDetails } = response.body.data;

                            return concat(
                                orderDetails
                                    ? of(
                                          createAction(
                                              OrderActionType.LoadOrderSucceeded,
                                              orderDetails,
                                          ),
                                      )
                                    : // TODO: Remove once we can submit orders using storefront API
                                      this.loadOrder(orderId, options),
                                defer(() => {
                                    this._orderCreated$.next(orderId);

                                    return of(
                                        createAction(
                                            OrderActionType.SubmitOrderSucceeded,
                                            response.body.data,
                                            {
                                                ...response.body.meta,
                                                token: response.headers.token,
                                            },
                                        ),
                                    );
                                }),
                            );
                        }),
                    );
                }).pipe(
                    catchError((error) =>
                        throwErrorAction(OrderActionType.SubmitOrderFailed, error),
                    ),
                ),
            );
    }

    finalizeOrder(
        orderId: number,
        options?: RequestOptions,
    ): Observable<FinalizeOrderAction | LoadOrderAction> {
        return concat(
            of(createAction(OrderActionType.FinalizeOrderRequested)),
            from(this._orderRequestSender.finalizeOrder(orderId, options)).pipe(
                switchMap((response) =>
                    concat(
                        this.loadOrder(orderId, options),
                        of(
                            createAction(
                                OrderActionType.FinalizeOrderSucceeded,
                                response.body.data,
                            ),
                        ),
                    ),
                ),
            ),
        ).pipe(catchError((error) => throwErrorAction(OrderActionType.FinalizeOrderFailed, error)));
    }

    private _getCurrentOrderId(state: InternalCheckoutSelectors): number | undefined {
        const order = state.order.getOrder();
        const checkout = state.checkout.getCheckout();

        return (order && order.orderId) || (checkout && checkout.orderId);
    }

    private _isReturnFullOrderDetailsEnabled(state: InternalCheckoutSelectors): boolean {
        const checkoutSettings = state.config.getStoreConfig()?.checkoutSettings;

        return Boolean(checkoutSettings?.features[RETURN_FULL_ORDER_DETAILS_ON_CREATE_ORDER]);
    }

    private _mapToOrderRequestBody(
        payload: OrderRequestBody,
        cartId: string,
        customerMessage: string,
        externalSource?: string,
    ): InternalOrderRequestBody {
        const { payment, ...order } = payload;

        if (!payment) {
            return {
                ...order,
                cartId,
                customerMessage,
                externalSource,
            };
        }

        return {
            ...order,
            cartId,
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
