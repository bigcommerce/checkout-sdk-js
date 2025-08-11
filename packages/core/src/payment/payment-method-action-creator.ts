import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';
import { Observable, Observer } from 'rxjs';

import { InternalCheckoutSelectors } from '../checkout';
import { ActionOptions, cachableAction } from '../common/data-store';
import { RequestOptions } from '../common/http-request';

import {
    LoadPaymentMethodAction,
    LoadPaymentMethodsAction,
    PaymentMethodActionType,
} from './payment-method-actions';
import PaymentMethodRequestSender from './payment-method-request-sender';

import { PaymentMethod } from '.';

const isPaymentMethod = (value: PaymentMethod | undefined): value is PaymentMethod => {
    return !!value;
};

export default class PaymentMethodActionCreator {
    constructor(private _requestSender: PaymentMethodRequestSender) {}

    loadPaymentMethodsById(
        methodIds: string[],
        options?: RequestOptions,
    ): ThunkAction<LoadPaymentMethodsAction, InternalCheckoutSelectors> {
        return (store) =>
            new Observable((observer: Observer<LoadPaymentMethodsAction>) => {
                const state = store.getState();
                const cartId = state.cart.getCart()?.id;
                const params = cartId ? { ...options?.params, cartId } : { ...options?.params };

                observer.next(createAction(PaymentMethodActionType.LoadPaymentMethodsRequested));
                Promise.all(
                    methodIds.map(async (id) => {
                        try {
                            const response = await this._requestSender.loadPaymentMethod(id, {
                                ...options,
                                params,
                            });

                            return response.body;
                        } catch (_e) {
                            return undefined;
                        }
                    }),
                )
                    .then((response) => {
                        const paymentMethods = response.filter(isPaymentMethod);

                        observer.next(
                            createAction(
                                PaymentMethodActionType.LoadPaymentMethodsSucceeded,
                                paymentMethods,
                            ),
                        );

                        observer.complete();
                    })
                    .catch((response) => {
                        observer.next(
                            createAction(
                                PaymentMethodActionType.LoadPaymentMethodsFailed,
                                response,
                            ),
                        );
                        observer.complete();
                    });
            });
    }

    loadPaymentMethods(
        options?: RequestOptions,
    ): ThunkAction<LoadPaymentMethodsAction, InternalCheckoutSelectors> {
        return (store) =>
            Observable.create((observer: Observer<LoadPaymentMethodsAction>) => {
                const state = store.getState();
                const cart = state.cart.getCartOrThrow();

                observer.next(createAction(PaymentMethodActionType.LoadPaymentMethodsRequested));

                this._requestSender
                    .loadPaymentMethods({
                        ...options,
                        params: { ...options?.params, cartId: cart.id },
                    })
                    .then((response) => {
                        const meta = {
                            deviceSessionId: response.headers['x-device-session-id'],
                            sessionHash: response.headers['x-session-hash'],
                        };
                        const methods = response.body;

                        observer.next(
                            createAction(
                                PaymentMethodActionType.LoadPaymentMethodsSucceeded,
                                methods,
                                meta,
                            ),
                        );
                        observer.complete();
                    })
                    .catch((response) => {
                        observer.error(
                            createErrorAction(
                                PaymentMethodActionType.LoadPaymentMethodsFailed,
                                response,
                            ),
                        );
                    });
            });
    }

    @cachableAction
    loadPaymentMethod(
        methodId: string,
        options?: RequestOptions & ActionOptions,
    ): ThunkAction<LoadPaymentMethodAction, InternalCheckoutSelectors> {
        return (store) =>
            Observable.create((observer: Observer<LoadPaymentMethodAction>) => {
                const state = store.getState();
                const cartId = state.cart.getCart()?.id;
                const params = cartId ? { ...options?.params, cartId } : { ...options?.params };

                observer.next(
                    createAction(PaymentMethodActionType.LoadPaymentMethodRequested, undefined, {
                        methodId,
                    }),
                );

                this._requestSender
                    .loadPaymentMethod(methodId, { ...options, params })
                    .then((response) => {
                        observer.next(
                            createAction(
                                PaymentMethodActionType.LoadPaymentMethodSucceeded,
                                response.body,
                                { methodId },
                            ),
                        );
                        observer.complete();
                    })
                    .catch((response) => {
                        observer.error(
                            createErrorAction(
                                PaymentMethodActionType.LoadPaymentMethodFailed,
                                response,
                                { methodId },
                            ),
                        );
                    });
            });
    }
}
