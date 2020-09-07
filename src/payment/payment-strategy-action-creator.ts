import { createAction, Action, ThunkAction } from '@bigcommerce/data-store';
import { concat, defer, empty, of, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { InternalCheckoutSelectors, ReadableCheckoutStore } from '../checkout';
import { throwErrorAction } from '../common/error';
import { MissingDataError, MissingDataErrorType } from '../common/error/errors';
import { RequestOptions } from '../common/http-request';
import { LoadOrderPaymentsAction, OrderActionCreator, OrderPaymentRequestBody, OrderRequestBody } from '../order';
import { OrderFinalizationNotRequiredError } from '../order/errors';
import { SpamProtectionAction, SpamProtectionActionCreator } from '../spam-protection';

import { PaymentInitializeOptions, PaymentRequestOptions } from './payment-request-options';
import { PaymentStrategyActionType, PaymentStrategyDeinitializeAction, PaymentStrategyExecuteAction, PaymentStrategyFinalizeAction, PaymentStrategyInitializeAction, PaymentStrategyWidgetAction } from './payment-strategy-actions';
import PaymentStrategyRegistry from './payment-strategy-registry';
import PaymentStrategyType from './payment-strategy-type';
import { PaymentStrategy } from './strategies';

export default class PaymentStrategyActionCreator {
    constructor(
        private _strategyRegistry: PaymentStrategyRegistry,
        private _orderActionCreator: OrderActionCreator,
        private _spamProtectionActionCreator: SpamProtectionActionCreator
    ) {}

    execute(payload: OrderRequestBody, options?: RequestOptions): ThunkAction<PaymentStrategyExecuteAction | SpamProtectionAction, InternalCheckoutSelectors> {
        const { payment = {} as OrderPaymentRequestBody, useStoreCredit } = payload;
        const meta = { methodId: payment.methodId };

        return store => concat(
            this._spamProtectionActionCreator.execute()(store),
            of(createAction(PaymentStrategyActionType.ExecuteRequested, undefined, meta)),
            defer(() => {
                const state = store.getState();

                let strategy: PaymentStrategy;

                if (state.payment.isPaymentDataRequired(useStoreCredit)) {
                    const method = state.paymentMethods.getPaymentMethod(payment.methodId, payment.gatewayId);

                    if (!method) {
                        throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                    }

                    strategy = this._strategyRegistry.getByMethod(method);
                } else {
                    strategy = this._strategyRegistry.get(PaymentStrategyType.NO_PAYMENT_DATA_REQUIRED);
                }

                return strategy
                    .execute(payload, { ...options, methodId: payment.methodId, gatewayId: payment.gatewayId })
                    .then(() => createAction(PaymentStrategyActionType.ExecuteSucceeded, undefined, meta));
            })
        ).pipe(
            catchError(error => throwErrorAction(PaymentStrategyActionType.ExecuteFailed, error, meta))
        );
    }

    finalize(options?: RequestOptions): ThunkAction<PaymentStrategyFinalizeAction, InternalCheckoutSelectors> {
        return store => concat(
            of(createAction(PaymentStrategyActionType.FinalizeRequested)),
            this._loadOrderPaymentsIfNeeded(store, options),
            defer(() => {
                const state = store.getState();
                const { providerId = '', gatewayId = '' } = state.payment.getPaymentId() || {};
                const method = state.paymentMethods.getPaymentMethod(providerId, gatewayId);

                if (!method) {
                    throw new OrderFinalizationNotRequiredError();
                }

                return this._strategyRegistry.getByMethod(method)
                    .finalize({ ...options, methodId: method.id, gatewayId: method.gateway })
                    .then(() => createAction(PaymentStrategyActionType.FinalizeSucceeded, undefined, { methodId: method.id }));
            })
        ).pipe(
            catchError(error => {
                const state = store.getState();
                const payment = state.payment.getPaymentId();

                return throwErrorAction(PaymentStrategyActionType.FinalizeFailed, error, { methodId: payment && payment.providerId });
            })
        );
    }

    initialize(options: PaymentInitializeOptions): ThunkAction<PaymentStrategyInitializeAction, InternalCheckoutSelectors> {
        const { methodId, gatewayId } = options;

        return store => defer(() => {
            const state = store.getState();
            const method = state.paymentMethods.getPaymentMethod(methodId, gatewayId);

            if (!method) {
                throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
            }

            if (methodId && state.paymentStrategies.isInitialized(methodId)) {
                return empty();
            }

            return concat(
                of(createAction(PaymentStrategyActionType.InitializeRequested, undefined, { methodId })),
                this._strategyRegistry.getByMethod(method)
                    .initialize({ ...options, methodId, gatewayId })
                    .then(() => createAction(PaymentStrategyActionType.InitializeSucceeded, undefined, { methodId }))
            );
        }).pipe(
            catchError(error => throwErrorAction(PaymentStrategyActionType.InitializeFailed, error, { methodId }))
        );
    }

    deinitialize(options: PaymentRequestOptions): ThunkAction<PaymentStrategyDeinitializeAction, InternalCheckoutSelectors> {
        const { methodId, gatewayId } = options;

        return store => defer(() => {
            const state = store.getState();
            const method = state.paymentMethods.getPaymentMethod(methodId, gatewayId);

            if (!method) {
                throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
            }

            if (methodId && !state.paymentStrategies.isInitialized(methodId)) {
                return empty();
            }

            return concat(
                of(createAction(PaymentStrategyActionType.DeinitializeRequested, undefined, { methodId })),
                this._strategyRegistry.getByMethod(method)
                    .deinitialize({ ...options, methodId, gatewayId })
                    .then(() => createAction(PaymentStrategyActionType.DeinitializeSucceeded, undefined, { methodId }))
            );
        }).pipe(
            catchError(error => throwErrorAction(PaymentStrategyActionType.DeinitializeFailed, error, { methodId }))
        );
    }

    widgetInteraction(method: () => Promise<any>, options?: PaymentRequestOptions): Observable<PaymentStrategyWidgetAction> {
        const methodId = options && options.methodId;
        const meta = { methodId };

        return concat(
            of(createAction(PaymentStrategyActionType.WidgetInteractionStarted, undefined, meta)),
            defer(() =>
                method().then(() => createAction(PaymentStrategyActionType.WidgetInteractionFinished, undefined, meta))
            )
        ).pipe(
            catchError(error => throwErrorAction(PaymentStrategyActionType.WidgetInteractionFailed, error, meta))
        );
    }

    enableEmbeddedSubmitButton(methodId: string): Action {
        return createAction(PaymentStrategyActionType.EmbeddedSubmitButtonStarted, undefined, { methodId });
    }

    disableEmbeddedSubmitButton(methodId?: string): Action {
        return createAction(PaymentStrategyActionType.EmbeddedSubmitButtonFinished, undefined, { methodId });
    }

    private _loadOrderPaymentsIfNeeded(store: ReadableCheckoutStore, options?: RequestOptions): Observable<LoadOrderPaymentsAction> {
        const state = store.getState();
        const checkout = state.checkout.getCheckout();

        if (checkout && checkout.orderId) {
            return this._orderActionCreator.loadOrderPayments(checkout.orderId, options);
        }

        return empty();
    }
}
