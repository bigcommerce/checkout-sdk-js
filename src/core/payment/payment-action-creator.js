import { Observable } from 'rxjs/Observable';
import { createAction, createErrorAction } from '../../data-store';
import * as actionTypes from './payment-action-types';

export default class PaymentActionCreator {
    /**
     * @constructor
     * @param {PaymentRequestSender} paymentRequestSender
     */
    constructor(paymentRequestSender) {
        this._paymentRequestSender = paymentRequestSender;
    }

    /**
     * @param {PaymentRequestBody} payment
     * @return {Observable<Action>}
     */
    submitPayment(payment) {
        return Observable.create((observer) => {
            observer.next(createAction(actionTypes.SUBMIT_PAYMENT_REQUESTED));

            return this._paymentRequestSender.submitPayment(payment)
                .then(({ body } = {}) => {
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
    initializeOffsitePayment(payment) {
        return Observable.create((observer) => {
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
