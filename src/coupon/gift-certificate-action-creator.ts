import { createAction, createErrorAction, Action, ReadableDataStore, ThunkAction } from '@bigcommerce/data-store';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { CheckoutClient, CheckoutSelectors } from '../checkout';
import { MissingDataError } from '../common/error/errors';
import { RequestOptions } from '../common/http-request';

import * as actionTypes from './gift-certificate-action-types';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class GiftCertificateActionCreator {
    constructor(
        private _checkoutClient: CheckoutClient
    ) {}

    applyGiftCertificate(giftCertificate: string, options?: RequestOptions): ThunkAction<Action> {
        return (store: ReadableDataStore<CheckoutSelectors>) => Observable.create((observer: Observer<Action>) => {
            const { checkout: { getCheckout } } = store.getState();
            const checkout = getCheckout();

            if (!checkout) {
                throw new MissingDataError('Unable to apply gift certificate because "checkout" data is missing.');
            }

            observer.next(createAction(actionTypes.APPLY_GIFT_CERTIFICATE_REQUESTED));

            this._checkoutClient.applyGiftCertificate(checkout.id, giftCertificate, options)
                .then(({ body }) => {
                    observer.next(createAction(actionTypes.APPLY_GIFT_CERTIFICATE_SUCCEEDED, body));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.APPLY_GIFT_CERTIFICATE_FAILED, response));
                });
        });
    }

    removeGiftCertificate(giftCertificate: string, options?: RequestOptions): ThunkAction<Action> {
        return (store: ReadableDataStore<CheckoutSelectors>) => Observable.create((observer: Observer<Action>) => {
            const { checkout: { getCheckout } } = store.getState();
            const checkout = getCheckout();

            if (!checkout) {
                throw new MissingDataError('Unable to remove gift certificate because "checkout" data is missing.');
            }

            observer.next(createAction(actionTypes.REMOVE_GIFT_CERTIFICATE_REQUESTED));

            this._checkoutClient.removeGiftCertificate(checkout.id, giftCertificate, options)
                .then(({ body }) => {
                    observer.next(createAction(actionTypes.REMOVE_GIFT_CERTIFICATE_SUCCEEDED, body));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.REMOVE_GIFT_CERTIFICATE_FAILED, response));
                });
        });
    }
}
