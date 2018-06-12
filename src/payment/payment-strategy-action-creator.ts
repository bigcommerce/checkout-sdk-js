import { createAction, createErrorAction, Action, ThunkAction } from '@bigcommerce/data-store';
import { concat } from 'rxjs/observable/concat';
import { empty } from 'rxjs/observable/empty';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { InternalCheckoutSelectors, ReadableCheckoutStore } from '../checkout';
import { MissingDataError } from '../common/error/errors';
import { RequestOptions } from '../common/http-request';
import { OrderActionCreator, OrderRequestBody } from '../order';
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
        return store => {
            const executeAction = Observable.create((observer: Observer<PaymentStrategyExecuteAction>) => {
                const state = store.getState();
                const { payment = {} as Payment, useStoreCredit } = payload;
                const meta = { methodId: payment.methodId };

                let strategy: PaymentStrategy;

                if (state.payment.isPaymentDataRequired(useStoreCredit)) {
                    const method = state.paymentMethods.getPaymentMethod(payment.methodId, payment.gatewayId);

                    if (!method) {
                        throw new MissingDataError(`Unable to submit payment because "paymentMethod (${payment.methodId})" data is missing.`);
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

            return concat(
                this._loadOrder(store, options),
                executeAction
            );
        };
    }

    finalize(options?: RequestOptions): ThunkAction<PaymentStrategyFinalizeAction, InternalCheckoutSelectors> {
        return store => {
            const finalizeAction = Observable.create((observer: Observer<PaymentStrategyFinalizeAction>) => {
                const state = store.getState();
                const order = state.order.getOrder();
                const payment = state.payment.getPaymentId();

                if (!order) {
                    throw new MissingDataError('Unable to finalize order because "order" data is missing.');
                }

                if (!payment) {
                    throw new OrderFinalizationNotRequiredError();
                }

                const method = state.paymentMethods.getPaymentMethod(payment.providerId, payment.gatewayId);
                const meta = { methodId: payment.providerId };

                if (!method) {
                    throw new MissingDataError(`Unable to finalize payment because "paymentMethod (${payment.providerId})" data is missing.`);
                }

                observer.next(createAction(PaymentStrategyActionType.FinalizeRequested, undefined, meta));

                this._strategyRegistry.getByMethod(method)
                    .finalize({ ...options, methodId: method.id, gatewayId: method.gateway })
                    .then(() => {
                        observer.next(createAction(PaymentStrategyActionType.FinalizeSucceeded, undefined, meta));
                        observer.complete();
                    })
                    .catch(error => {
                        observer.error(createErrorAction(PaymentStrategyActionType.FinalizeFailed, error, meta));
                    });
            });

            return concat(
                this._loadOrder(store, options),
                finalizeAction
            );
        };
    }

    initialize(options: PaymentInitializeOptions): ThunkAction<PaymentStrategyInitializeAction, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<PaymentStrategyInitializeAction>) => {
            const state = store.getState();
            const { methodId, gatewayId } = options;
            const method = state.paymentMethods.getPaymentMethod(methodId, gatewayId);

            if (!method) {
                throw new MissingDataError(`Unable to initialize because "paymentMethod (${methodId})" data is missing.`);
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
                throw new MissingDataError(`Unable to deinitialize because "paymentMethod (${methodId})" data is missing.`);
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

    private _loadOrder(store: ReadableCheckoutStore, options?: RequestOptions): Observable<Action> {
        const state = store.getState();
        const checkout = state.checkout.getCheckout();

        if (!checkout) {
            throw new MissingDataError('Unable to load order because "checkout" is missing.');
        }

        if (!checkout.orderId) {
            return empty();
        }

        return this._orderActionCreator.loadOrder(checkout.orderId, options);
    }
}
