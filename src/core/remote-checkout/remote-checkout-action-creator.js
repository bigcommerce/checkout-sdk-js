import { Observable } from 'rxjs/Observable';
import { createAction, createErrorAction } from '../../data-store';
import * as actionTypes from './remote-checkout-action-types';

export default class RemoteCheckoutActionCreator {
    /**
     * @constructor
     * @param {RemoteCheckoutRequestSender} remoteCheckoutRequestSender
     */
    constructor(remoteCheckoutRequestSender) {
        this._remoteCheckoutRequestSender = remoteCheckoutRequestSender;
    }

    /**
     * @param {string} methodName
     * @param {Object} params
     * @param {string} [params.referenceId]
     * @param {RequestOptions} [options]
     * @return {Observable<Action>}
     */
    initializeBilling(methodName, params, options) {
        return Observable.create((observer) => {
            observer.next(createAction(actionTypes.INITIALIZE_REMOTE_BILLING_REQUESTED));

            this._remoteCheckoutRequestSender.initializeBilling(methodName, params, options)
                .then(({ body: { data } = {} }) => {
                    observer.next(createAction(actionTypes.INITIALIZE_REMOTE_BILLING_SUCCEEDED, data));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.INITIALIZE_REMOTE_BILLING_FAILED, response));
                });
        });
    }

    /**
     * @param {string} methodName
     * @param {Object} params
     * @param {string} [params.referenceId]
     * @param {RequestOptions} [options]
     * @return {Observable<Action>}
     */
    initializeShipping(methodName, params, options) {
        return Observable.create((observer) => {
            observer.next(createAction(actionTypes.INITIALIZE_REMOTE_SHIPPING_REQUESTED));

            this._remoteCheckoutRequestSender.initializeShipping(methodName, params, options)
                .then(({ body: { data } = {} }) => {
                    observer.next(createAction(actionTypes.INITIALIZE_REMOTE_SHIPPING_SUCCEEDED, data));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.INITIALIZE_REMOTE_SHIPPING_FAILED, response));
                });
        });
    }

    /**
     * @param {string} methodName
     * @param {Object} params
     * @param {string} [params.referenceId]
     * @param {boolean} [params.useStoreCredit]
     * @param {boolean} [params.authorizationToken]
     * @param {RequestOptions} [options]
     * @return {Observable<Action>}
     */
    initializePayment(methodName, params, options) {
        return Observable.create((observer) => {
            observer.next(createAction(actionTypes.INITIALIZE_REMOTE_PAYMENT_REQUESTED));

            this._remoteCheckoutRequestSender.initializePayment(methodName, params, options)
                .then(({ body: { data } = {} }) => {
                    observer.next(createAction(actionTypes.INITIALIZE_REMOTE_PAYMENT_SUCCEEDED, data));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.INITIALIZE_REMOTE_PAYMENT_FAILED, response));
                });
        });
    }

    /**
     * @param {string} methodName
     * @param {RemoteCheckoutMeta} meta
     * @return {Action}
     */
    setCheckoutMeta(methodName, meta) {
        return createAction(actionTypes.SET_REMOTE_CHECKOUT_META, {
            [methodName]: meta,
        });
    }
}
