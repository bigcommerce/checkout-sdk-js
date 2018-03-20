import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { MissingDataError } from '../common/error/errors';
import { OrderRequestBody } from '../order';
import { OrderFinalizationNotRequiredError } from '../order/errors';
import Payment from './payment';
import {
    PaymentStrategyActionType,
    PaymentStrategyDeinitializeAction,
    PaymentStrategyExecuteAction,
    PaymentStrategyFinalizeAction,
    PaymentStrategyInitializeAction,
} from './payment-strategy-actions';
import PaymentStrategyRegistry from './payment-strategy-registry';
import { InitializeOptions } from './strategies/payment-strategy';

export default class PaymentStrategyActionCreator {
    constructor(
        private _strategyRegistry: PaymentStrategyRegistry
    ) {}

    execute(payload: OrderRequestBody, options?: any): ThunkAction<PaymentStrategyExecuteAction> {
        return (store) => Observable.create((observer: Observer<PaymentStrategyExecuteAction>) => {
            const { checkout } = store.getState();
            const { payment = {} as Payment } = payload;
            const method = checkout.getPaymentMethod(payment.name, payment.gateway);
            const meta = { methodId: method.id };

            observer.next(createAction(PaymentStrategyActionType.ExecuteRequested, undefined, meta));

            this._strategyRegistry.getByMethod(method)
                .execute(payload, options)
                .then(() => {
                    observer.next(createAction(PaymentStrategyActionType.ExecuteSucceeded, undefined, meta));
                    observer.complete();
                })
                .catch((error) => {
                    observer.error(createErrorAction(PaymentStrategyActionType.ExecuteFailed, error, meta));
                });
        });
    }

    finalize(options?: any): ThunkAction<PaymentStrategyFinalizeAction> {
        return (store) => Observable.create((observer: Observer<PaymentStrategyFinalizeAction>) => {
            const { checkout } = store.getState();
            const order = checkout.getOrder();

            if (!order) {
                throw new MissingDataError();
            }

            if (!order.payment || !order.payment.id) {
                throw new OrderFinalizationNotRequiredError();
            }

            const method = checkout.getPaymentMethod(order.payment.id, order.payment.gateway);
            const meta = { methodId: method.id };

            observer.next(createAction(PaymentStrategyActionType.FinalizeRequested, undefined, meta));

            this._strategyRegistry.getByMethod(method)
                .finalize(options)
                .then(() => {
                    observer.next(createAction(PaymentStrategyActionType.FinalizeSucceeded, undefined, meta));
                    observer.complete();
                })
                .catch((error) => {
                    observer.error(createErrorAction(PaymentStrategyActionType.FinalizeFailed, error, meta));
                });
        });
    }

    initialize(methodId: string, gatewayId?: string, options?: InitializeOptions): ThunkAction<PaymentStrategyInitializeAction> {
        return (store) => Observable.create((observer: Observer<PaymentStrategyInitializeAction>) => {
            const { checkout } = store.getState();
            const method = checkout.getPaymentMethod(methodId, gatewayId);

            if (!method) {
                throw new MissingDataError();
            }

            observer.next(createAction(PaymentStrategyActionType.InitializeRequested, undefined, { methodId }));

            this._strategyRegistry.getByMethod(method)
                .initialize({ ...options, paymentMethod: method })
                .then(() => {
                    observer.next(createAction(PaymentStrategyActionType.InitializeSucceeded, undefined, { methodId }));
                    observer.complete();
                })
                .catch((error) => {
                    observer.error(createErrorAction(PaymentStrategyActionType.InitializeFailed, error, { methodId }));
                });
        });
    }

    deinitialize(methodId: string, gatewayId?: string, options?: any): ThunkAction<PaymentStrategyDeinitializeAction> {
        return (store) => Observable.create((observer: Observer<PaymentStrategyDeinitializeAction>) => {
            const { checkout } = store.getState();
            const method = checkout.getPaymentMethod(methodId, gatewayId);

            if (!method) {
                throw new MissingDataError();
            }

            observer.next(createAction(PaymentStrategyActionType.DeinitializeRequested, undefined, { methodId }));

            this._strategyRegistry.getByMethod(method)
                .deinitialize(options)
                .then(() => {
                    observer.next(createAction(PaymentStrategyActionType.DeinitializeSucceeded, undefined, { methodId }));
                    observer.complete();
                })
                .catch((error) => {
                    observer.error(createErrorAction(PaymentStrategyActionType.DeinitializeFailed, error, { methodId }));
                });
        });
    }
}
