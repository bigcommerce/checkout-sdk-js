import { createAction, createErrorAction, Action } from '@bigcommerce/data-store';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { CheckoutClient } from '../checkout';
import { RequestOptions } from '../common/http-request';

import * as actionTypes from './gift-certificate-action-types';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class GiftCertificateActionCreator {
    constructor(
        private _checkoutClient: CheckoutClient
    ) {}

    applyGiftCertificate(checkoutId: string, giftCertificate: string, options?: RequestOptions): Observable<Action> {
        return Observable.create((observer: Observer<Action>) => {
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

    removeGiftCertificate(checkoutId: string, giftCertificate: string, options?: RequestOptions): Observable<Action> {
        return Observable.create((observer: Observer<Action>) => {
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
