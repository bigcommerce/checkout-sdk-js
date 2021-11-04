import { createAction, createErrorAction } from '@bigcommerce/data-store';
import { Observable, Observer } from 'rxjs';

import { CheckoutStore } from '../checkout';
import { cachableAction, ActionOptions } from '../common/data-store';
import { RequestOptions } from '../common/http-request';

import { PaymentMethod } from '.';
import { LoadPaymentMethodsAction, LoadPaymentMethodAction, PaymentMethodActionType } from './payment-method-actions';
import PaymentMethodRequestSender from './payment-method-request-sender';
import { isApplePayWindow } from './strategies/apple-pay';

const APPLEPAYID = 'applepay';

export default class PaymentMethodActionCreator {
    constructor(
        private _store: CheckoutStore,
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

                    observer.next(createAction(PaymentMethodActionType.LoadPaymentMethodsSucceeded, this._filterPaymentMethods(response.body), meta));
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

    private _filterPaymentMethods(methods: PaymentMethod[]): PaymentMethod[] {
        return methods.filter(method => {
            // remove ApplePay in a non-Apple environment
            if (method.id === APPLEPAYID && !isApplePayWindow(window)) {
                return false;
            }

            // remove methods that cannot work with multi-address shipping when multiple consignments detected
            const consignments = this._store.getState().consignments.getConsignments();
            if (consignments && consignments.length > 1 && method.providesShippingAddress) {
                return false;
            }

            return true;
        });
    }
}
