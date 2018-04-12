import { createAction, createErrorAction, Action } from '@bigcommerce/data-store';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import * as actionTypes from './payment-action-types';
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

    /**
     * @param {PaymentRequestBody} payment
     * @return {Observable<Action>}
     */
    submitPayment(payment: any): Observable<Action> {
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

    /**
     * @param {PaymentRequestBody} payment
     * @return {Observable<Action>}
     */
    initializeOffsitePayment(payment: any): Observable<Action> {
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
