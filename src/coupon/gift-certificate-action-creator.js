import { Observable } from 'rxjs/Observable';
import { createAction, createErrorAction } from '@bigcommerce/data-store';
import * as actionTypes from './gift-certificate-action-types';

export default class GiftCertificateActionCreator {
    /**
     * @constructor
     * @param {CheckoutClient} checkoutClient
     */
    constructor(checkoutClient) {
        this._checkoutClient = checkoutClient;
    }

    /**
     * @param {string} checkoutId
     * @param {string} giftCertificate
     * @param {RequestOptions} [options]
     * @return {Observable<Action>}
     */
    applyGiftCertificate(checkoutId, giftCertificate, options) {
        return Observable.create((observer) => {
            observer.next(createAction(actionTypes.APPLY_GIFT_CERTIFICATE_REQUESTED));

            this._checkoutClient.applyGiftCertificate(checkoutId, giftCertificate, options)
                .then(({ body } = {}) => {
                    observer.next(createAction(actionTypes.APPLY_GIFT_CERTIFICATE_SUCCEEDED, body));
                    observer.complete();
                })
                .catch((response) => {
                    observer.error(createErrorAction(actionTypes.APPLY_GIFT_CERTIFICATE_FAILED, response));
                });
        });
    }

    /**
     * @param {string} checkoutId
     * @param {string} giftCertificate
     * @param {RequestOptions} [options]
     * @return {Observable<Action>}
     */
    removeGiftCertificate(checkoutId, giftCertificate, options) {
        return Observable.create((observer) => {
            observer.next(createAction(actionTypes.REMOVE_GIFT_CERTIFICATE_REQUESTED));

            this._checkoutClient.removeGiftCertificate(checkoutId, giftCertificate, options)
                .then(({ body } = {}) => {
                    observer.next(createAction(actionTypes.REMOVE_GIFT_CERTIFICATE_SUCCEEDED, body));
                    observer.complete();
                })
                .catch((response) => {
                    observer.error(createErrorAction(actionTypes.REMOVE_GIFT_CERTIFICATE_FAILED, response));
                });
        });
    }
}
