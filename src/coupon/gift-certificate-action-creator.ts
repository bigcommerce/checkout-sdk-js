import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { InternalCheckoutSelectors } from '../checkout';
import { MissingDataError } from '../common/error/errors';
import { RequestOptions } from '../common/http-request';

import { GiftCertificateRequestSender } from '.';
import { ApplyGiftCertificateAction, GiftCertificateActionType, RemoveGiftCertificateAction } from './gift-certificate-actions';

export default class GiftCertificateActionCreator {
    constructor(
        private _giftCertificateRequestSender: GiftCertificateRequestSender
    ) {}

    applyGiftCertificate(giftCertificate: string, options?: RequestOptions): ThunkAction<ApplyGiftCertificateAction, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<ApplyGiftCertificateAction>) => {
            const state = store.getState();
            const checkout = state.checkout.getCheckout();

            if (!checkout) {
                throw new MissingDataError('Unable to apply gift certificate because "checkout" data is missing.');
            }

            observer.next(createAction(GiftCertificateActionType.ApplyGiftCertificateRequested));

            this._giftCertificateRequestSender.applyGiftCertificate(checkout.id, giftCertificate, options)
                .then(({ body }) => {
                    observer.next(createAction(GiftCertificateActionType.ApplyGiftCertificateSucceeded, body));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(GiftCertificateActionType.ApplyGiftCertificateFailed, response));
                });
        });
    }

    removeGiftCertificate(giftCertificate: string, options?: RequestOptions): ThunkAction<RemoveGiftCertificateAction, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<RemoveGiftCertificateAction>) => {
            const state = store.getState();
            const checkout = state.checkout.getCheckout();

            if (!checkout) {
                throw new MissingDataError('Unable to remove gift certificate because "checkout" data is missing.');
            }

            observer.next(createAction(GiftCertificateActionType.RemoveGiftCertificateRequested));

            this._giftCertificateRequestSender.removeGiftCertificate(checkout.id, giftCertificate, options)
                .then(({ body }) => {
                    observer.next(createAction(GiftCertificateActionType.RemoveGiftCertificateSucceeded, body));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(GiftCertificateActionType.RemoveGiftCertificateFailed, response));
                });
        });
    }
}
