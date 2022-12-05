import { Action, createAction, createErrorAction } from '@bigcommerce/data-store';
import { concat, defer, Observable, Observer, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { CheckoutActionCreator } from '../checkout';
import { throwErrorAction } from '../common/error';
import { RequestOptions } from '../common/http-request';

import { RemoteCheckoutActionType } from './remote-checkout-actions';
import RemoteCheckoutRequestSender, {
    InitializePaymentOptions,
} from './remote-checkout-request-sender';
import { RemoteCheckoutStateData } from './remote-checkout-state';

/**
 * @todo Convert this file into TypeScript properly
 * i.e.: Action<T>
 */
export default class RemoteCheckoutActionCreator {
    constructor(
        private _remoteCheckoutRequestSender: RemoteCheckoutRequestSender,
        private _checkoutActionCreator: CheckoutActionCreator,
    ) {}

    initializeBilling(
        methodId: string,
        params?: { referenceId: string },
        options?: RequestOptions,
    ): Observable<Action> {
        return Observable.create((observer: Observer<Action>) => {
            observer.next(
                createAction(RemoteCheckoutActionType.InitializeRemoteBillingRequested, undefined, {
                    methodId,
                }),
            );

            this._remoteCheckoutRequestSender
                .initializeBilling(methodId, params, options)
                .then(({ body = {} }) => {
                    observer.next(
                        createAction(
                            RemoteCheckoutActionType.InitializeRemoteBillingSucceeded,
                            body,
                            { methodId },
                        ),
                    );
                    observer.complete();
                })
                .catch((response) => {
                    observer.error(
                        createErrorAction(
                            RemoteCheckoutActionType.InitializeRemoteBillingFailed,
                            response,
                            { methodId },
                        ),
                    );
                });
        });
    }

    initializeShipping(
        methodId: string,
        params?: { referenceId: string },
        options?: RequestOptions,
    ): Observable<Action> {
        return Observable.create((observer: Observer<Action>) => {
            observer.next(
                createAction(
                    RemoteCheckoutActionType.InitializeRemoteShippingRequested,
                    undefined,
                    { methodId },
                ),
            );

            this._remoteCheckoutRequestSender
                .initializeShipping(methodId, params, options)
                .then(({ body = {} }) => {
                    observer.next(
                        createAction(
                            RemoteCheckoutActionType.InitializeRemoteShippingSucceeded,
                            body,
                            { methodId },
                        ),
                    );
                    observer.complete();
                })
                .catch((response) => {
                    observer.error(
                        createErrorAction(
                            RemoteCheckoutActionType.InitializeRemoteShippingFailed,
                            response,
                            { methodId },
                        ),
                    );
                });
        });
    }

    initializePayment(
        methodId: string,
        params?: InitializePaymentOptions,
        options?: RequestOptions,
    ): Observable<Action> {
        return Observable.create((observer: Observer<Action>) => {
            observer.next(
                createAction(RemoteCheckoutActionType.InitializeRemotePaymentRequested, undefined, {
                    methodId,
                }),
            );

            this._remoteCheckoutRequestSender
                .initializePayment(methodId, params, options)
                .then(({ body = {} }) => {
                    observer.next(
                        createAction(
                            RemoteCheckoutActionType.InitializeRemotePaymentSucceeded,
                            body,
                            { methodId },
                        ),
                    );
                    observer.complete();
                })
                .catch((response) => {
                    observer.error(
                        createErrorAction(
                            RemoteCheckoutActionType.InitializeRemotePaymentFailed,
                            response,
                            { methodId },
                        ),
                    );
                });
        });
    }

    loadSettings(methodId: string, options?: RequestOptions): Observable<Action> {
        return Observable.create((observer: Observer<Action>) => {
            observer.next(
                createAction(RemoteCheckoutActionType.LoadRemoteSettingsRequested, undefined, {
                    methodId,
                }),
            );

            this._remoteCheckoutRequestSender
                .loadSettings(methodId, options)
                .then(({ body }) => {
                    observer.next(
                        createAction(RemoteCheckoutActionType.LoadRemoteSettingsSucceeded, body, {
                            methodId,
                        }),
                    );
                    observer.complete();
                })
                .catch((response) => {
                    observer.error(
                        createErrorAction(
                            RemoteCheckoutActionType.LoadRemoteSettingsFailed,
                            response,
                            { methodId },
                        ),
                    );
                });
        });
    }

    signOut(methodId: string, options?: RequestOptions): Observable<Action> {
        return Observable.create((observer: Observer<Action>) => {
            observer.next(
                createAction(RemoteCheckoutActionType.SignOutRemoteCustomerRequested, undefined, {
                    methodId,
                }),
            );

            this._remoteCheckoutRequestSender
                .signOut(methodId, options)
                .then(() => {
                    observer.next(
                        createAction(
                            RemoteCheckoutActionType.SignOutRemoteCustomerSucceeded,
                            undefined,
                            { methodId },
                        ),
                    );
                    observer.complete();
                })
                .catch((response) => {
                    observer.error(
                        createErrorAction(
                            RemoteCheckoutActionType.SignOutRemoteCustomerFailed,
                            response,
                            { methodId },
                        ),
                    );
                });
        });
    }

    forgetCheckout(methodId: string, options?: RequestOptions): Observable<Action> {
        return concat(
            of(
                createAction(
                    RemoteCheckoutActionType.ForgetCheckoutRemoteCustomerRequested,
                    undefined,
                    { methodId },
                ),
            ),
            defer(async () => {
                await this._remoteCheckoutRequestSender.forgetCheckout(options);
                await this._checkoutActionCreator.loadCurrentCheckout();

                return createAction(
                    RemoteCheckoutActionType.ForgetCheckoutRemoteCustomerSucceeded,
                    undefined,
                    { methodId },
                );
            }),
        ).pipe(
            catchError((error) =>
                throwErrorAction(
                    RemoteCheckoutActionType.ForgetCheckoutRemoteCustomerFailed,
                    error,
                    { methodId },
                ),
            ),
        );
    }

    updateCheckout<K extends keyof RemoteCheckoutStateData>(
        methodId: K,
        data: Partial<RemoteCheckoutStateData[K]>,
    ): Action {
        return createAction(RemoteCheckoutActionType.UpdateRemoteCheckout, data, { methodId });
    }
}
