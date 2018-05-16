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
                const meta = { methodId: payment.name };

                let strategy: PaymentStrategy;

                if (state.order.isPaymentDataRequired(useStoreCredit)) {
                    const method = state.paymentMethods.getPaymentMethod(payment.name, payment.gateway);

                    if (!method) {
                        throw new MissingDataError(`Unable to submit payment because "paymentMethod (${payment.name})" data is missing.`);
                    }

                    strategy = this._strategyRegistry.getByMethod(method);
                } else {
                    strategy = this._strategyRegistry.get('nopaymentdatarequired');
                }

                observer.next(createAction(PaymentStrategyActionType.ExecuteRequested, undefined, meta));

                strategy
                    .execute(payload, { ...options, methodId: payment.name, gatewayId: payment.gateway })
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

                if (!order) {
                    throw new MissingDataError('Unable to finalize order because "order" data is missing.');
                }

                if (!order.payment || !order.payment.id) {
                    throw new OrderFinalizationNotRequiredError();
                }

                const method = state.paymentMethods.getPaymentMethod(order.payment.id, order.payment.gateway);
                const meta = { methodId: order.payment.id };

                if (!method) {
                    throw new MissingDataError(`Unable to finalize payment because "paymentMethod (${order.payment.id})" data is missing.`);
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
