import { createAction, createErrorAction, Action } from '@bigcommerce/data-store';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import * as actionTypes from './payment-action-types';
import PaymentRequestBody from './payment-request-body';
import PaymentRequestSender from './payment-request-sender';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class PaymentActionCreator {
    /**
     * @constructor
     * @param {PaymentRequestSender} paymentRequestSender
     */
    constructor(
        private _paymentRequestSender: PaymentRequestSender
    ) {}

    submitPayment(payment: PaymentRequestBody): Observable<Action> {
        return Observable.create((observer: Observer<Action>) => {
            observer.next(createAction(actionTypes.SUBMIT_PAYMENT_REQUESTED));

            return this._paymentRequestSender.submitPayment(payment)
                .then(({ body }) => {
                    observer.next(createAction(actionTypes.SUBMIT_PAYMENT_SUCCEEDED, body));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.SUBMIT_PAYMENT_FAILED, response));
                });
        });
    }

    initializeOffsitePayment(payment: PaymentRequestBody): Observable<Action> {
        return Observable.create((observer: Observer<Action>) => {
            observer.next(createAction(actionTypes.INITIALIZE_OFFSITE_PAYMENT_REQUESTED));

            return this._paymentRequestSender.initializeOffsitePayment(payment)
                .then(() => {
                    observer.next(createAction(actionTypes.INITIALIZE_OFFSITE_PAYMENT_SUCCEEDED));
                    observer.complete();
                })
                .catch(() => {
                    observer.error(createErrorAction(actionTypes.INITIALIZE_OFFSITE_PAYMENT_FAILED));
                });
        });
    }
}
