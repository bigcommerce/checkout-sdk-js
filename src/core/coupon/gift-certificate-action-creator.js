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
     * @param {string} giftCertificate
     * @param {RequestOptions} [options]
     * @return {Observable<Action>}
     */
    applyGiftCertificate(giftCertificate, options) {
        return Observable.create((observer) => {
            observer.next(createAction(actionTypes.APPLY_GIFT_CERTIFICATE_REQUESTED));

            this._checkoutClient.applyGiftCertificate(giftCertificate, options)
                .then(({ body: { data } = {} }) => {
                    observer.next(createAction(actionTypes.APPLY_GIFT_CERTIFICATE_SUCCEEDED, data));
                    observer.complete();
                })
                .catch((response) => {
                    observer.error(createErrorAction(actionTypes.APPLY_GIFT_CERTIFICATE_FAILED, response));
                });
        });
    }

    /**
     * @param {string} giftCertificate
     * @param {RequestOptions} [options]
     * @return {Observable<Action>}
     */
    removeGiftCertificate(giftCertificate, options) {
        return Observable.create((observer) => {
            observer.next(createAction(actionTypes.REMOVE_GIFT_CERTIFICATE_REQUESTED));

            this._checkoutClient.removeGiftCertificate(giftCertificate, options)
                .then(({ body: { data } = {} }) => {
                    observer.next(createAction(actionTypes.REMOVE_GIFT_CERTIFICATE_SUCCEEDED, data));
                    observer.complete();
                })
                .catch((response) => {
                    observer.error(createErrorAction(actionTypes.REMOVE_GIFT_CERTIFICATE_FAILED, response));
                });
        });
    }
}
