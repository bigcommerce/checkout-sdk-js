import { createAction, ThunkAction } from '@bigcommerce/data-store';
import { concat, defer, empty, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { PaymentStrategy as PaymentStrategyV2 } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { InternalCheckoutSelectors, ReadableCheckoutStore } from '../checkout';
import { throwErrorAction } from '../common/error';
import { MissingDataError, MissingDataErrorType } from '../common/error/errors';
import { RequestOptions } from '../common/http-request';
import {
    LoadOrderPaymentsAction,
    OrderActionCreator,
    OrderPaymentRequestBody,
    OrderRequestBody,
} from '../order';
import { OrderFinalizationNotRequiredError } from '../order/errors';
import { SpamProtectionAction, SpamProtectionActionCreator } from '../spam-protection';

import PaymentMethod from './payment-method';
import { PaymentInitializeOptions, PaymentRequestOptions } from './payment-request-options';
import {
    PaymentStrategyActionType,
    PaymentStrategyDeinitializeAction,
    PaymentStrategyExecuteAction,
    PaymentStrategyFinalizeAction,
    PaymentStrategyInitializeAction,
    PaymentStrategyWidgetAction,
} from './payment-strategy-actions';
import PaymentStrategyRegistry from './payment-strategy-registry';
import PaymentStrategyRegistryV2 from './payment-strategy-registry-v2';
import PaymentStrategyType from './payment-strategy-type';
import PaymentStrategyWidgetActionCreator from './payment-strategy-widget-action-creator';
import { PaymentStrategy } from './strategies';

export default class PaymentStrategyActionCreator {
    private _paymentStrategyWidgetActionCreator: PaymentStrategyWidgetActionCreator;

    constructor(
        private _strategyRegistry: PaymentStrategyRegistry,
        private _strategyRegistryV2: PaymentStrategyRegistryV2,
        private _orderActionCreator: OrderActionCreator,
        private _spamProtectionActionCreator: SpamProtectionActionCreator,
    ) {
        this._paymentStrategyWidgetActionCreator = new PaymentStrategyWidgetActionCreator();
    }

    execute(
        payload: OrderRequestBody,
        options?: RequestOptions,
    ): ThunkAction<PaymentStrategyExecuteAction | SpamProtectionAction, InternalCheckoutSelectors> {
        const { payment = {} as OrderPaymentRequestBody, useStoreCredit } = payload;
        const meta = { methodId: payment.methodId };

        return (store) => {
            const { checkout } = store.getState();
            const { shouldExecuteSpamCheck } = checkout.getCheckoutOrThrow();

            return concat(
                shouldExecuteSpamCheck
                    ? this._spamProtectionActionCreator.verifyCheckoutSpamProtection()(store)
                    : empty(),
                of(createAction(PaymentStrategyActionType.ExecuteRequested, undefined, meta)),
                defer(() => {
                    const state = store.getState();

                    let strategy: PaymentStrategy | PaymentStrategyV2;

                    if (state.payment.isPaymentDataRequired(useStoreCredit)) {
                        const method = state.paymentMethods.getPaymentMethod(
                            payment.methodId,
                            payment.gatewayId,
                        );

                        if (!method) {
                            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                        }

                        strategy = this._getStrategy(method);
                    } else {
                        strategy = this._strategyRegistryV2.get({
                            id: PaymentStrategyType.NO_PAYMENT_DATA_REQUIRED,
                        });
                    }

                    const promise: Promise<InternalCheckoutSelectors | void> = strategy.execute(
                        payload,
                        {
                            ...options,
                            methodId: payment.methodId,
                            gatewayId: payment.gatewayId,
                        },
                    );

                    return promise.then(() =>
                        createAction(PaymentStrategyActionType.ExecuteSucceeded, undefined, meta),
                    );
                }),
            ).pipe(
                catchError((error) =>
                    throwErrorAction(PaymentStrategyActionType.ExecuteFailed, error, meta),
                ),
            );
        };
    }

    finalize(
        options?: RequestOptions,
    ): ThunkAction<PaymentStrategyFinalizeAction, InternalCheckoutSelectors> {
        return (store) =>
            concat(
                of(createAction(PaymentStrategyActionType.FinalizeRequested)),
                this._loadOrderPaymentsIfNeeded(store, options),
                defer(async () => {
                    const state = store.getState();
                    const { providerId = '', gatewayId = '' } = state.payment.getPaymentId() || {};
                    const method = state.paymentMethods.getPaymentMethod(providerId, gatewayId);

                    if (!method) {
                        throw new OrderFinalizationNotRequiredError();
                    }

                    const strategy = this._getStrategy(method);

                    await strategy.finalize({
                        ...options,
                        methodId: method.id,
                        gatewayId: method.gateway,
                    });

                    return createAction(PaymentStrategyActionType.FinalizeSucceeded, undefined, {
                        methodId: method.id,
                    });
                }),
            ).pipe(
                catchError((error) => {
                    const state = store.getState();
                    const payment = state.payment.getPaymentId();

                    return throwErrorAction(PaymentStrategyActionType.FinalizeFailed, error, {
                        methodId: payment && payment.providerId,
                    });
                }),
            );
    }

    initialize(
        options: PaymentInitializeOptions,
    ): ThunkAction<PaymentStrategyInitializeAction, InternalCheckoutSelectors> {
        const { methodId, gatewayId } = options;

        return (store) =>
            defer(() => {
                const state = store.getState();
                const method = state.paymentMethods.getPaymentMethod(methodId, gatewayId);

                if (!method) {
                    throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                }

                if (methodId && state.paymentStrategies.isInitialized({ methodId, gatewayId })) {
                    return empty();
                }

                const strategy = this._getStrategy(method);

                const promise: Promise<InternalCheckoutSelectors | void> = strategy.initialize({
                    ...options,
                    methodId,
                    gatewayId,
                });

                return concat(
                    of(
                        createAction(PaymentStrategyActionType.InitializeRequested, undefined, {
                            methodId,
                            gatewayId,
                        }),
                    ),
                    promise.then(() =>
                        createAction(PaymentStrategyActionType.InitializeSucceeded, undefined, {
                            methodId,
                            gatewayId,
                        }),
                    ),
                );
            }).pipe(
                catchError((error) =>
                    throwErrorAction(PaymentStrategyActionType.InitializeFailed, error, {
                        methodId,
                        gatewayId,
                    }),
                ),
            );
    }

    deinitialize(
        options: PaymentRequestOptions,
    ): ThunkAction<PaymentStrategyDeinitializeAction, InternalCheckoutSelectors> {
        const { methodId, gatewayId } = options;

        return (store) =>
            defer(() => {
                const state = store.getState();
                const method = state.paymentMethods.getPaymentMethod(methodId, gatewayId);

                if (!method) {
                    throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                }

                if (methodId && !state.paymentStrategies.isInitialized({ methodId, gatewayId })) {
                    return empty();
                }

                const strategy = this._getStrategy(method);

                const promise: Promise<InternalCheckoutSelectors | void> = strategy.deinitialize({
                    ...options,
                    methodId,
                    gatewayId,
                });

                return concat(
                    of(
                        createAction(PaymentStrategyActionType.DeinitializeRequested, undefined, {
                            methodId,
                            gatewayId,
                        }),
                    ),
                    promise.then(() =>
                        createAction(PaymentStrategyActionType.DeinitializeSucceeded, undefined, {
                            methodId,
                            gatewayId,
                        }),
                    ),
                );
            }).pipe(
                catchError((error) =>
                    throwErrorAction(PaymentStrategyActionType.DeinitializeFailed, error, {
                        methodId,
                        gatewayId,
                    }),
                ),
            );
    }

    widgetInteraction(
        method: () => Promise<unknown>,
        options?: PaymentRequestOptions,
    ): Observable<PaymentStrategyWidgetAction> {
        return this._paymentStrategyWidgetActionCreator.widgetInteraction(method, options);
    }

    private _getStrategy(method: PaymentMethod): PaymentStrategy | PaymentStrategyV2 {
        let strategy: PaymentStrategy | PaymentStrategyV2;

        try {
            strategy = this._strategyRegistry.getByMethod(method);
        } catch {
            strategy = this._strategyRegistryV2.get({
                id: method.id,
                gateway: method.gateway,
                type: method.type,
            });
        }

        return strategy;
    }

    private _loadOrderPaymentsIfNeeded(
        store: ReadableCheckoutStore,
        options?: RequestOptions,
    ): Observable<LoadOrderPaymentsAction> {
        const state = store.getState();
        const checkout = state.checkout.getCheckout();

        if (checkout && checkout.orderId) {
            return this._orderActionCreator.loadOrderPayments(checkout.orderId, options);
        }

        return empty();
    }
}
