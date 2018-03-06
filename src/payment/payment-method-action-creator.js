import { Observable } from 'rxjs/Observable';
import { createAction, createErrorAction } from '@bigcommerce/data-store';
import * as actionTypes from './payment-method-action-types';

export default class PaymentMethodActionCreator {
    /**
     * @constructor
     * @param {CheckoutClient} checkoutClient
     */
    constructor(checkoutClient) {
        this._checkoutClient = checkoutClient;
    }

    /**
     * @param {RequestOptions} [options]
     * @return {Observable<Action>}
     */
    loadPaymentMethods(options) {
        return Observable.create((observer) => {
            observer.next(createAction(actionTypes.LOAD_PAYMENT_METHODS_REQUESTED));

            this._checkoutClient.loadPaymentMethods(options)
                .then(({ body: { data } = {} }) => {
                    observer.next(createAction(actionTypes.LOAD_PAYMENT_METHODS_SUCCEEDED, data));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.LOAD_PAYMENT_METHODS_FAILED, response));
                });
        });
    }

    /**
     * @param {string} methodId
     * @param {RequestOptions} [options]
     * @return {Observable<Action>}
     */
    loadPaymentMethod(methodId, options) {
        return Observable.create((observer) => {
            observer.next(createAction(actionTypes.LOAD_PAYMENT_METHOD_REQUESTED, undefined, { methodId }));

            this._checkoutClient.loadPaymentMethod(methodId, options)
                .then(({ body: { data } = {} }) => {
                    observer.next(createAction(actionTypes.LOAD_PAYMENT_METHOD_SUCCEEDED, data, { methodId }));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.LOAD_PAYMENT_METHOD_FAILED, response, { methodId }));
                });
        });
    }

    /**
     * @param {string} methodId
     * @param {function(): Promise<any>} initializer
     * @return {Observable<Action>}
     */
    initializePaymentMethod(methodId, initializer) {
        return Observable.create((observer) => {
            observer.next(createAction(actionTypes.INITIALIZE_PAYMENT_METHOD_REQUESTED, undefined, { methodId }));

            initializer()
                .then((data) => {
                    observer.next(createAction(actionTypes.INITIALIZE_PAYMENT_METHOD_SUCCEEDED, data, { methodId }));
                    observer.complete();
                })
                .catch((response) => {
                    observer.error(createErrorAction(actionTypes.INITIALIZE_PAYMENT_METHOD_FAILED, response, { methodId }));
                });
        });
    }
}
