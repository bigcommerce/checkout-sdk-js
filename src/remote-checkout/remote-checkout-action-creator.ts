import { createAction, createErrorAction, Action } from '@bigcommerce/data-store';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { RequestOptions } from '../common/http-request';

import * as actionTypes from './remote-checkout-action-types';
import RemoteCheckoutRequestSender, { InitializePaymentOptions } from './remote-checkout-request-sender';
import { RemoteCheckoutStateData } from './remote-checkout-state';

/**
 * @todo Convert this file into TypeScript properly
 * i.e.: Action<T>
 */
export default class RemoteCheckoutActionCreator {
    constructor(
        private _remoteCheckoutRequestSender: RemoteCheckoutRequestSender
    ) {}

    initializeBilling(methodId: string, params: { referenceId: string }, options?: RequestOptions): Observable<Action> {
        return Observable.create((observer: Observer<Action>) => {
            observer.next(createAction(actionTypes.INITIALIZE_REMOTE_BILLING_REQUESTED, undefined, { methodId }));

            this._remoteCheckoutRequestSender.initializeBilling(methodId, params, options)
                .then(({ body = {} }) => {
                    observer.next(createAction(actionTypes.INITIALIZE_REMOTE_BILLING_SUCCEEDED, body, { methodId }));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.INITIALIZE_REMOTE_BILLING_FAILED, response, { methodId }));
                });
        });
    }

    initializeShipping(methodId: string, params: { referenceId: string }, options?: RequestOptions): Observable<Action> {
        return Observable.create((observer: Observer<Action>) => {
            observer.next(createAction(actionTypes.INITIALIZE_REMOTE_SHIPPING_REQUESTED, undefined, { methodId }));

            this._remoteCheckoutRequestSender.initializeShipping(methodId, params, options)
                .then(({ body = {} }) => {
                    observer.next(createAction(actionTypes.INITIALIZE_REMOTE_SHIPPING_SUCCEEDED, body, { methodId }));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.INITIALIZE_REMOTE_SHIPPING_FAILED, response, { methodId }));
                });
        });
    }

    initializePayment(methodId: string, params: InitializePaymentOptions, options?: RequestOptions): Observable<Action> {
        return Observable.create((observer: Observer<Action>) => {
            observer.next(createAction(actionTypes.INITIALIZE_REMOTE_PAYMENT_REQUESTED, undefined, { methodId }));

            this._remoteCheckoutRequestSender.initializePayment(methodId, params, options)
                .then(({ body = {} }) => {
                    observer.next(createAction(actionTypes.INITIALIZE_REMOTE_PAYMENT_SUCCEEDED, body, { methodId }));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.INITIALIZE_REMOTE_PAYMENT_FAILED, response, { methodId }));
                });
        });
    }

    loadSettings(methodId: string, options?: RequestOptions): Observable<Action> {
        return Observable.create((observer: Observer<Action>) => {
            observer.next(createAction(actionTypes.LOAD_REMOTE_SETTINGS_REQUESTED, undefined, { methodId }));

            this._remoteCheckoutRequestSender.loadSettings(methodId, options)
                .then(({ body }) => {
                    observer.next(createAction(actionTypes.LOAD_REMOTE_SETTINGS_SUCCEEDED, body, { methodId }));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.LOAD_REMOTE_SETTINGS_FAILED, response, { methodId }));
                });
        });
    }

    signOut(methodId: string, options?: RequestOptions): Observable<Action> {
        return Observable.create((observer: Observer<Action>) => {
            observer.next(createAction(actionTypes.SIGN_OUT_REMOTE_CUSTOMER_REQUESTED, undefined, { methodId }));

            this._remoteCheckoutRequestSender.signOut(methodId, options)
                .then(() => {
                    observer.next(createAction(actionTypes.SIGN_OUT_REMOTE_CUSTOMER_SUCCEEDED, undefined, { methodId }));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.SIGN_OUT_REMOTE_CUSTOMER_FAILED, response, { methodId }));
                });
        });
    }

    updateCheckout<K extends keyof RemoteCheckoutStateData>(methodId: K, data: Partial<RemoteCheckoutStateData[K]>): Action {
        return createAction(actionTypes.UPDATE_REMOTE_CHECKOUT, data, { methodId });
    }
}
