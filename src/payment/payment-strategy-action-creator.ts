import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';
import { concat } from 'rxjs/observable/concat';
import { defer } from 'rxjs/observable/defer';
import { empty } from 'rxjs/observable/empty';
import { of } from 'rxjs/observable/of';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { InternalCheckoutSelectors, ReadableCheckoutStore } from '../checkout';
import { throwErrorAction } from '../common/error';
import { MissingDataError, MissingDataErrorType } from '../common/error/errors';
import { RequestOptions } from '../common/http-request';
import { LoadOrderPaymentsAction, OrderActionCreator, OrderRequestBody } from '../order';
import { OrderFinalizationNotRequiredError } from '../order/errors';

import Payment from './payment';
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
import { PaymentStrategy } from './strategies';

export default class PaymentStrategyActionCreator {
    constructor(
        private _strategyRegistry: PaymentStrategyRegistry,
        private _orderActionCreator: OrderActionCreator
    ) {}

    execute(payload: OrderRequestBody, options?: RequestOptions): ThunkAction<PaymentStrategyExecuteAction, InternalCheckoutSelectors> {
        return store => new Observable((observer: Observer<PaymentStrategyExecuteAction>) => {
            const state = store.getState();
            const { payment = {} as Payment, useStoreCredit } = payload;
            const meta = { methodId: payment.methodId };

            let strategy: PaymentStrategy;

            if (state.payment.isPaymentDataRequired(useStoreCredit)) {
                const method = state.paymentMethods.getPaymentMethod(payment.methodId, payment.gatewayId);

                if (!method) {
                    throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                }

                strategy = this._strategyRegistry.getByMethod(method);
            } else {
                strategy = this._strategyRegistry.get('nopaymentdatarequired');
            }

            observer.next(createAction(PaymentStrategyActionType.ExecuteRequested, undefined, meta));

            strategy
                .execute(payload, { ...options, methodId: payment.methodId, gatewayId: payment.gatewayId })
                .then(() => {
                    observer.next(createAction(PaymentStrategyActionType.ExecuteSucceeded, undefined, meta));
                    observer.complete();
                })
                .catch(error => {
                    observer.error(createErrorAction(PaymentStrategyActionType.ExecuteFailed, error, meta));
                });
        });
    }

    finalize(options?: RequestOptions): ThunkAction<PaymentStrategyFinalizeAction, InternalCheckoutSelectors> {
        return store => concat(
            of(createAction(PaymentStrategyActionType.FinalizeRequested)),
            this._loadOrderPaymentsIfNeeded(store, options),
            defer(() => {
                const state = store.getState();
                const payment = state.payment.getPaymentId();

                if (!payment) {
                    throw new OrderFinalizationNotRequiredError();
                }

                const method = state.paymentMethods.getPaymentMethod(payment.providerId, payment.gatewayId);

                if (!method) {
                    throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                }

                return this._strategyRegistry.getByMethod(method)
                    .finalize({ ...options, methodId: method.id, gatewayId: method.gateway })
                    .then(() => createAction(PaymentStrategyActionType.FinalizeSucceeded, undefined, { methodId: payment.providerId }));
            })
        ).pipe(
            catchError(error => {
                const state = store.getState();
                const payment = state.payment.getPaymentId();

                return concat(
                    this._loadOrderPaymentsIfNeeded(store, options),
                    throwErrorAction(PaymentStrategyActionType.FinalizeFailed, error, { methodId: payment && payment.providerId })
                );
            })
        );
    }

    initialize(options: PaymentInitializeOptions): ThunkAction<PaymentStrategyInitializeAction, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<PaymentStrategyInitializeAction>) => {
            const state = store.getState();
            const { methodId, gatewayId } = options;
            const method = state.paymentMethods.getPaymentMethod(methodId, gatewayId);

            if (!method) {
                throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
            }

            observer.next(createAction(PaymentStrategyActionType.InitializeRequested, undefined, { methodId }));

            this._strategyRegistry.getByMethod(method)
                .initialize({ ...options, methodId, gatewayId })
                .then(() => {
                    observer.next(createAction(PaymentStrategyActionType.InitializeSucceeded, undefined, { methodId }));
                    observer.complete();
                })
                .catch(error => {
                    observer.error(createErrorAction(PaymentStrategyActionType.InitializeFailed, error, { methodId }));
                });
        });
    }

    deinitialize(options: PaymentRequestOptions): ThunkAction<PaymentStrategyDeinitializeAction, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<PaymentStrategyDeinitializeAction>) => {
            const state = store.getState();
            const { methodId, gatewayId } = options;
            const method = state.paymentMethods.getPaymentMethod(methodId, gatewayId);

            if (!method) {
                throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
            }

            observer.next(createAction(PaymentStrategyActionType.DeinitializeRequested, undefined, { methodId }));

            this._strategyRegistry.getByMethod(method)
                .deinitialize({ ...options, methodId, gatewayId })
                .then(() => {
                    observer.next(createAction(PaymentStrategyActionType.DeinitializeSucceeded, undefined, { methodId }));
                    observer.complete();
                })
                .catch(error => {
                    observer.error(createErrorAction(PaymentStrategyActionType.DeinitializeFailed, error, { methodId }));
                });
        });
    }

    widgetInteraction(method: () => Promise<any>, options?: PaymentRequestOptions): ThunkAction<PaymentStrategyWidgetAction> {
        return store => Observable.create((observer: Observer<PaymentStrategyWidgetAction>) => {
            const methodId = options && options.methodId;
            const meta = { methodId };

            observer.next(createAction(PaymentStrategyActionType.WidgetInteractionStarted, undefined, meta));

            method().then(() => {
                observer.next(createAction(PaymentStrategyActionType.WidgetInteractionFinished, undefined, meta));
                observer.complete();
            })
            .catch(error => {
                observer.error(createErrorAction(PaymentStrategyActionType.WidgetInteractionFailed, error, meta));
            });
        });
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
