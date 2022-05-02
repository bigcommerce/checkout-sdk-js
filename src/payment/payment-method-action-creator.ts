import { createAction, createErrorAction } from '@bigcommerce/data-store';
import { filter } from 'lodash';
import { Observable, Observer } from 'rxjs';

import { cachableAction, ActionOptions } from '../common/data-store';
import { RequestOptions } from '../common/http-request';

import { PaymentMethod } from '.';
import { LoadPaymentMethodsAction, LoadPaymentMethodAction, PaymentMethodActionType } from './payment-method-actions';
import PaymentMethodRequestSender from './payment-method-request-sender';
import { isApplePayWindow } from './strategies/apple-pay';

const APPLEPAYID = 'applepay';

export default class PaymentMethodActionCreator {
    constructor(
        private _requestSender: PaymentMethodRequestSender
    ) {}

    loadPaymentMethods(options?: RequestOptions): Observable<LoadPaymentMethodsAction> {
        return Observable.create((observer: Observer<LoadPaymentMethodsAction>) => {
            observer.next(createAction(PaymentMethodActionType.LoadPaymentMethodsRequested));

            this._requestSender.loadPaymentMethods(options)
                .then(response => {
                    const meta = {
                        deviceSessionId: response.headers['x-device-session-id'],
                        sessionHash: response.headers['x-session-hash'],
                    };
                    const methods = response.body;
                    const filteredMethods = Array.isArray(methods) ? this._filterApplePay(methods) : methods;
                    observer.next(createAction(PaymentMethodActionType.LoadPaymentMethodsSucceeded, filteredMethods, meta));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(PaymentMethodActionType.LoadPaymentMethodsFailed, response));
                });
        });
    }

    @cachableAction
    loadPaymentMethod(methodId: string, options?: RequestOptions & ActionOptions): Observable<LoadPaymentMethodAction> {
        return Observable.create((observer: Observer<LoadPaymentMethodAction>) => {
            observer.next(createAction(PaymentMethodActionType.LoadPaymentMethodRequested, undefined, { methodId }));

            this._requestSender.loadPaymentMethod(methodId, options)
                .then(response => {
                    observer.next(createAction(PaymentMethodActionType.LoadPaymentMethodSucceeded, response.body, { methodId }));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(PaymentMethodActionType.LoadPaymentMethodFailed, response, { methodId }));
                });
        });
    }

    private _filterApplePay(methods: PaymentMethod[]): PaymentMethod[] {

        return filter(methods, method => {
            if (method.id === APPLEPAYID && !isApplePayWindow(window)) {
                return false;
            }

            return true;
        });
    }
}
