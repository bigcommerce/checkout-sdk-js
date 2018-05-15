import { createAction, createErrorAction, Action } from '@bigcommerce/data-store';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { CheckoutClient } from '../checkout';
import { RequestOptions } from '../common/http-request';

import * as actionTypes from './payment-method-action-types';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class PaymentMethodActionCreator {
    constructor(
        private _checkoutClient: CheckoutClient
    ) {}

    loadPaymentMethods(options?: RequestOptions): Observable<Action> {
        return Observable.create((observer: Observer<Action>) => {
            observer.next(createAction(actionTypes.LOAD_PAYMENT_METHODS_REQUESTED));

            this._checkoutClient.loadPaymentMethods(options)
                .then(response => {
                    observer.next(createAction(actionTypes.LOAD_PAYMENT_METHODS_SUCCEEDED, response.body.data));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.LOAD_PAYMENT_METHODS_FAILED, response));
                });
        });
    }

    loadPaymentMethod(methodId: string, options?: RequestOptions): Observable<Action> {
        return Observable.create((observer: Observer<Action>) => {
            observer.next(createAction(actionTypes.LOAD_PAYMENT_METHOD_REQUESTED, undefined, { methodId }));

            this._checkoutClient.loadPaymentMethod(methodId, options)
                .then(response => {
                    observer.next(createAction(actionTypes.LOAD_PAYMENT_METHOD_SUCCEEDED, response.body.data, { methodId }));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.LOAD_PAYMENT_METHOD_FAILED, response, { methodId }));
                });
        });
    }
}
