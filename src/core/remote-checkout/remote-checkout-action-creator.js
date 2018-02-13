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
                .then(({ body = {} }) => {
                    observer.next(createAction(actionTypes.INITIALIZE_REMOTE_BILLING_SUCCEEDED, body));
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
                .then(({ body = {} }) => {
                    observer.next(createAction(actionTypes.INITIALIZE_REMOTE_SHIPPING_SUCCEEDED, body));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.INITIALIZE_REMOTE_SHIPPING_FAILED, response));
                });
        });
    }

    /**
     * @param {string} methodId
     * @param {Object} params
     * @param {string} [params.referenceId]
     * @param {boolean} [params.useStoreCredit]
     * @param {boolean} [params.authorizationToken]
     * @param {RequestOptions} [options]
     * @return {Observable<Action>}
     */
    initializePayment(methodId, params, options) {
        return Observable.create((observer) => {
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

    /**
     * @param {string} methodName
     * @param {RequestOptions} [options]
     * @return {Observable<Action>}
     */
    signOut(methodName, options) {
        return Observable.create((observer) => {
            observer.next(createAction(actionTypes.SIGN_OUT_REMOTE_CUSTOMER_REQUESTED));

            this._remoteCheckoutRequestSender.signOut(methodName, options)
                .then(() => {
                    observer.next(createAction(actionTypes.SIGN_OUT_REMOTE_CUSTOMER_SUCCEEDED));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.SIGN_OUT_REMOTE_CUSTOMER_FAILED, response));
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
