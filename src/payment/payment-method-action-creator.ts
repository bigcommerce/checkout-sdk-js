import { createAction, createErrorAction } from '@bigcommerce/data-store';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { CheckoutClient } from '../checkout';
import { RequestOptions } from '../common/http-request';

import { LoadPaymentMethodsAction, LoadPaymentMethodAction, PaymentMethodActionType } from './payment-method-actions';

export default class PaymentMethodActionCreator {
    constructor(
        private _checkoutClient: CheckoutClient
    ) {}

    loadPaymentMethods(options?: RequestOptions): Observable<LoadPaymentMethodsAction> {
        return Observable.create((observer: Observer<LoadPaymentMethodsAction>) => {
            observer.next(createAction(PaymentMethodActionType.LoadPaymentMethodsRequested));

            this._checkoutClient.loadPaymentMethods(options)
                .then(response => {
                    observer.next(createAction(PaymentMethodActionType.LoadPaymentMethodsSucceeded, response.body.data, response.body.meta));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(PaymentMethodActionType.LoadPaymentMethodsFailed, response));
                });
        });
    }

    loadPaymentMethod(methodId: string, options?: RequestOptions): Observable<LoadPaymentMethodAction> {
        return Observable.create((observer: Observer<LoadPaymentMethodAction>) => {
            observer.next(createAction(PaymentMethodActionType.LoadPaymentMethodRequested, undefined, { methodId }));

            this._checkoutClient.loadPaymentMethod(methodId, options)
                .then(response => {
                    observer.next(createAction(PaymentMethodActionType.LoadPaymentMethodSucceeded, response.body.data, { methodId }));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(PaymentMethodActionType.LoadPaymentMethodFailed, response, { methodId }));
                });
        });
    }
}
