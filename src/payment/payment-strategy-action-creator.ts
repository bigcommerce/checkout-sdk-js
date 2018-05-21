import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { InternalCheckoutSelectors } from '../checkout';
import { MissingDataError } from '../common/error/errors';
import { RequestOptions } from '../common/http-request';
import { OrderRequestBody } from '../order';
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
        private _strategyRegistry: PaymentStrategyRegistry
    ) {}

    execute(payload: OrderRequestBody, options?: RequestOptions): ThunkAction<PaymentStrategyExecuteAction, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<PaymentStrategyExecuteAction>) => {
            const state = store.getState();
            const { payment = {} as Payment, useStoreCredit } = payload;
            const meta = { methodId: payment.methodId };

            let strategy: PaymentStrategy;

            if (state.order.isPaymentDataRequired(useStoreCredit)) {
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
    }

    finalize(options?: RequestOptions): ThunkAction<PaymentStrategyFinalizeAction, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<PaymentStrategyFinalizeAction>) => {
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
}
