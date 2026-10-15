import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';
import { Response } from '@bigcommerce/request-sender';
import { concat, defer, from, Observable, Observer, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { isExperimentEnabled } from '@bigcommerce/checkout-sdk/utility';

import { CartConflictError, CartConsistencyError } from '../cart/errors';
import { Checkout, CheckoutValidator, InternalCheckoutSelectors } from '../checkout';
import { throwErrorAction } from '../common/error';
import { MissingDataError, MissingDataErrorType } from '../common/error/errors';
import { RequestOptions } from '../common/http-request';
import { SpamProtectionNotCompletedError } from '../spam-protection/errors';

import InternalOrder from './internal-order';
import InternalOrderRequestBody from './internal-order-request-body';
import { InternalOrderResponseBody } from './internal-order-responses';
import mapFromInternalOrder from './map-from-internal-order';
import Order from './order';
import {
    FinalizeOrderAction,
    LoadOrderAction,
    LoadOrderPaymentsAction,
    OrderActionType,
    SubmitOrderAction,
} from './order-actions';
import OrderCreatedNotifier from './order-created-notifier';
import OrderRequestBody from './order-request-body';
import OrderRequestSender from './order-request-sender';

export const RETURN_FULL_ORDER_DETAILS_ON_CREATE_ORDER =
    'PROJECT-8987.return_full_order_details_on_create_order';

export const VALIDATE_CART_VERSION_ON_ORDER_CREATION =
    'PROJECT-8987.validate_cart_version_on_order_creation';

export const INFER_ORDER_DETAILS_FROM_SUBMIT_ORDER_RESPONSE =
    'PROJECT-8987.infer_order_details_from_submit_order_response';

export default class OrderActionCreator {
    constructor(
        private _orderRequestSender: OrderRequestSender,
        private _checkoutValidator: CheckoutValidator,
        private _orderCreatedNotifier: OrderCreatedNotifier,
    ) {}

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
                    const shouldInferOrderDetails = this._isInferOrderDetailsEnabled(state);
                    const includeOrderDetails =
                        !shouldInferOrderDetails && this._isReturnFullOrderDetailsEnabled(state);
                    const shouldValidateCartVersion =
                        this._isValidateCartVersionOnOrderCreationEnabled(state);

                    if (!checkout) {
                        throw new MissingDataError(MissingDataErrorType.MissingCheckout);
                    }

                    if (checkout.shouldExecuteSpamCheck) {
                        throw new SpamProtectionNotCompletedError();
                    }

                    const submitOrderRequest = (version?: number) =>
                        this._submitOrderRequest(
                            checkout,
                            payload,
                            externalSource,
                            variantIdentificationToken,
                            includeOrderDetails,
                            options,
                            version,
                        );

                    let submittedVersion = checkout.version;

                    const orderSubmission = shouldValidateCartVersion
                        ? submitOrderRequest(submittedVersion).catch((error) => {
                              if (!(error instanceof CartConflictError)) {
                                  throw error;
                              }

                              return this._checkoutValidator
                                  .validate(checkout, options)
                                  .then((freshCheckout) => {
                                      submittedVersion = freshCheckout.cart.version;

                                      return submitOrderRequest(submittedVersion).catch(
                                          (retryError) => {
                                              if (retryError instanceof CartConflictError) {
                                                  throw new CartConsistencyError();
                                              }

                                              throw retryError;
                                          },
                                      );
                                  });
                          })
                        : this._checkoutValidator
                              .validate(checkout, options)
                              .then(() => submitOrderRequest());

                    return from(orderSubmission).pipe(
                        switchMap((response) => {
                            const { order, orderDetails } = response.body.data;
                            const orderId = order.orderId;

                            return concat(
                                this._getOrderLoadAction$(
                                    order,
                                    orderDetails,
                                    shouldInferOrderDetails ? checkout : undefined,
                                    options,
                                ),
                                defer(() => {
                                    this._orderCreatedNotifier.notify(orderId);

                                    return of(
                                        createAction(
                                            OrderActionType.SubmitOrderSucceeded,
                                            response.body.data,
                                            {
                                                ...response.body.meta,
                                                token: response.headers.token,
                                                ...(shouldValidateCartVersion && {
                                                    version: submittedVersion + 1,
                                                }),
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

    private _getOrderLoadAction$(
        order: InternalOrder,
        orderDetails: Order | undefined,
        checkoutToInferFrom: Checkout | undefined,
        options?: RequestOptions,
    ): Observable<LoadOrderAction> {
        if (orderDetails) {
            return of(createAction(OrderActionType.LoadOrderSucceeded, orderDetails));
        }

        if (checkoutToInferFrom?.billingAddress) {
            return of(
                createAction(
                    OrderActionType.LoadOrderSucceeded,
                    mapFromInternalOrder(
                        order,
                        checkoutToInferFrom,
                        checkoutToInferFrom.billingAddress,
                    ),
                    { internalOrder: order },
                ),
            );
        }

        // TODO: Remove once we can submit orders using storefront API
        return this.loadOrder(order.orderId, options);
    }

    private _getCurrentOrderId(state: InternalCheckoutSelectors): number | undefined {
        const order = state.order.getOrder();
        const checkout = state.checkout.getCheckout();

        return (order && order.orderId) || (checkout && checkout.orderId);
    }

    private _isInferOrderDetailsEnabled(state: InternalCheckoutSelectors): boolean {
        const { checkoutSettings } = state.config.getStoreConfigOrThrow();

        return isExperimentEnabled(
            checkoutSettings.features,
            INFER_ORDER_DETAILS_FROM_SUBMIT_ORDER_RESPONSE,
            false,
        );
    }

    private _isReturnFullOrderDetailsEnabled(state: InternalCheckoutSelectors): boolean {
        const { checkoutSettings } = state.config.getStoreConfigOrThrow();

        return isExperimentEnabled(
            checkoutSettings.features,
            RETURN_FULL_ORDER_DETAILS_ON_CREATE_ORDER,
            false,
        );
    }

    private _isValidateCartVersionOnOrderCreationEnabled(
        state: InternalCheckoutSelectors,
    ): boolean {
        const { checkoutSettings } = state.config.getStoreConfigOrThrow();

        return isExperimentEnabled(
            checkoutSettings.features,
            VALIDATE_CART_VERSION_ON_ORDER_CREATION,
        );
    }

    private _submitOrderRequest(
        checkout: Checkout,
        payload: OrderRequestBody | undefined,
        externalSource: string | undefined,
        variantIdentificationToken: string | undefined,
        includeOrderDetails: boolean,
        options?: RequestOptions,
        version?: number,
    ): Promise<Response<InternalOrderResponseBody>> {
        return this._orderRequestSender.submitOrder(
            this._mapToOrderRequestBody(
                payload ?? {},
                checkout.id,
                checkout.customerMessage,
                externalSource,
                version,
            ),
            {
                ...options,
                headers: {
                    checkoutVariant: variantIdentificationToken,
                },
                includeOrderDetails,
            },
        );
    }

    private _mapToOrderRequestBody(
        payload: OrderRequestBody,
        cartId: string,
        customerMessage: string,
        externalSource?: string,
        version?: number,
    ): InternalOrderRequestBody {
        const { payment, ...order } = payload;

        if (!payment) {
            return {
                ...order,
                cartId,
                customerMessage,
                externalSource,
                version,
            };
        }

        return {
            ...order,
            cartId,
            customerMessage,
            externalSource,
            version,
            payment: {
                paymentData: payment.paymentData,
                name: payment.methodId,
                gateway: payment.gatewayId,
            },
        };
    }
}
