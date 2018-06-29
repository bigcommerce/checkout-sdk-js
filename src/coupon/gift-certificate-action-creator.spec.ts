import { createRequestSender, Response } from '@bigcommerce/request-sender';
import { Observable } from 'rxjs';

import { createCheckoutStore, CheckoutStore, CheckoutStoreState } from '../checkout';
import { getCheckout, getCheckoutStoreState, getCheckoutWithGiftCertificates } from '../checkout/checkouts.mock';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';

import GiftCertificateActionCreator from './gift-certificate-action-creator';
import { GiftCertificateActionType } from './gift-certificate-actions';
import GiftCertificateRequestSender from './gift-certificate-request-sender';

describe('GiftCertificateActionCreator', () => {
    let errorResponse: Response;
    let giftCertificateActionCreator: GiftCertificateActionCreator;
    let giftCertificateRequestSender: GiftCertificateRequestSender;
    let response: Response;
    let state: CheckoutStoreState;
    let store: CheckoutStore;

    beforeEach(() => {
        errorResponse = getErrorResponse();
        state = getCheckoutStoreState();
        store = createCheckoutStore(state);

        giftCertificateRequestSender = new GiftCertificateRequestSender(createRequestSender());
        giftCertificateActionCreator = new GiftCertificateActionCreator(giftCertificateRequestSender);
    });

    describe('#applyGiftCertificate()', () => {
        beforeEach(() => {
            response = getResponse(getCheckoutWithGiftCertificates());

            jest.spyOn(giftCertificateRequestSender, 'applyGiftCertificate')
                .mockReturnValue(Promise.resolve(response));

            jest.spyOn(store, 'dispatch');
        });

        it('emits actions if able to apply giftCertificate', async () => {
            const giftCertificate = 'myGiftCertificate1234';
            const actions = await Observable.from(giftCertificateActionCreator.applyGiftCertificate(giftCertificate)(store))
                .toArray()
                .toPromise();

            expect(actions).toEqual([
                { type: GiftCertificateActionType.ApplyGiftCertificateRequested },
                { type: GiftCertificateActionType.ApplyGiftCertificateSucceeded, payload: response.body },
            ]);
        });

        it('emits error actions if unable to apply giftCertificate', async () => {
            jest.spyOn(giftCertificateRequestSender, 'applyGiftCertificate')
                .mockReturnValue(Promise.reject(errorResponse));

            const giftCertificate = 'myGiftCertificate1234';
            const errorHandler = jest.fn(action => Observable.of(action));
            const actions = await Observable.from(giftCertificateActionCreator.applyGiftCertificate(giftCertificate)(store))
                .catch(errorHandler)
                .toArray()
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: GiftCertificateActionType.ApplyGiftCertificateRequested },
                { type: GiftCertificateActionType.ApplyGiftCertificateFailed, payload: errorResponse, error: true },
            ]);
        });
    });

    describe('#removeGiftCertificate()', () => {
        beforeEach(() => {
            response = getResponse(getCheckout());

            jest.spyOn(giftCertificateRequestSender, 'removeGiftCertificate')
                .mockReturnValue(Promise.resolve(response));

            jest.spyOn(store, 'dispatch');
        });

        it('emits actions if able to remove giftCertificate', async () => {
            const giftCertificate = 'myGiftCertificate1234';
            const actions = await Observable.from(giftCertificateActionCreator.removeGiftCertificate(giftCertificate)(store))
                .toArray()
                .toPromise();

            expect(actions).toEqual([
                { type: GiftCertificateActionType.RemoveGiftCertificateRequested },
                { type: GiftCertificateActionType.RemoveGiftCertificateSucceeded, payload: response.body },
            ]);
        });

        it('emits error actions if unable to remove giftCertificate', async () => {
            jest.spyOn(giftCertificateRequestSender, 'removeGiftCertificate')
                .mockReturnValue(Promise.reject(errorResponse));

            const giftCertificate = 'myGiftCertificate1234';
            const errorHandler = jest.fn(action => Observable.of(action));
            const actions = await Observable.from(giftCertificateActionCreator.removeGiftCertificate(giftCertificate)(store))
                .catch(errorHandler)
                .toArray()
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: GiftCertificateActionType.RemoveGiftCertificateRequested },
                { type: GiftCertificateActionType.RemoveGiftCertificateFailed, payload: errorResponse, error: true },
            ]);
        });
    });
});
