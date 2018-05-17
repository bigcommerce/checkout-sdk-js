import { Observable } from 'rxjs';
import { createCheckoutStore } from '../checkout';
import { getCheckoutState } from '../checkout/checkouts.mock';
import { getGiftCertificateResponseBody } from './internal-gift-certificates.mock';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';
import GiftCertificateActionCreator from './gift-certificate-action-creator';
import { GiftCertificateActionType } from './gift-certificate-actions';

describe('GiftCertificateActionCreator', () => {
    let checkoutClient;
    let errorResponse;
    let giftCertificateActionCreator;
    let response;
    let store;

    beforeEach(() => {
        response = getResponse(getGiftCertificateResponseBody());
        errorResponse = getErrorResponse();
        store = createCheckoutStore({
            checkout: getCheckoutState(),
        });

        checkoutClient = {
            applyGiftCertificate: jest.fn(() => Promise.resolve(response)),
            removeGiftCertificate: jest.fn(() => Promise.resolve(response)),
        };

        giftCertificateActionCreator = new GiftCertificateActionCreator(checkoutClient);
    });

    describe('#applyGiftCertificate()', () => {
        beforeEach(() => {
            jest.spyOn(store, 'dispatch');
        });

        it('emits actions if able to apply giftCertificate', () => {
            const giftCertificate = 'myGiftCertificate1234';

            Observable.from(giftCertificateActionCreator.applyGiftCertificate(giftCertificate)(store))
                .toArray()
                .subscribe((actions) => {
                    expect(actions).toEqual([
                        { type: GiftCertificateActionType.ApplyGiftCertificateRequested },
                        { type: GiftCertificateActionType.ApplyGiftCertificateSucceeded, payload: response.body.data },
                    ]);
                });
        });

        it('emits error actions if unable to apply giftCertificate', () => {
            checkoutClient.applyGiftCertificate.mockReturnValue(Promise.reject(errorResponse));

            const giftCertificate = 'myGiftCertificate1234';
            const errorHandler = jest.fn((action) => Observable.of(action));

            Observable.from(giftCertificateActionCreator.applyGiftCertificate(giftCertificate)(store))
                .catch(errorHandler)
                .toArray()
                .subscribe((actions) => {
                    expect(errorHandler).toHaveBeenCalled();
                    expect(actions).toEqual([
                        { type: GiftCertificateActionType.ApplyGiftCertificateRequested },
                        { type: GiftCertificateActionType.ApplyGiftCertificateFailed, payload: errorResponse, error: true },
                    ]);
                });
        });
    });

    describe('#removeGiftCertificate()', () => {
        beforeEach(() => {
            jest.spyOn(store, 'dispatch');
        });

        it('emits actions if able to remove giftCertificate', () => {
            const giftCertificate = 'myGiftCertificate1234';

            Observable.from(giftCertificateActionCreator.removeGiftCertificate(giftCertificate)(store))
                .toArray()
                .subscribe((actions) => {
                    expect(actions).toEqual([
                        { type: GiftCertificateActionType.RemoveGiftCertificateRequestedAction },
                        { type: GiftCertificateActionType.RemoveGiftCertificateSucceededAction, payload: response.body.data },
                    ]);
                });
        });

        it('emits error actions if unable to remove giftCertificate', () => {
            checkoutClient.removeGiftCertificate.mockReturnValue(Promise.reject(errorResponse));

            const giftCertificate = 'myGiftCertificate1234';
            const errorHandler = jest.fn((action) => Observable.of(action));

            Observable.from(giftCertificateActionCreator.removeGiftCertificate(giftCertificate)(store))
                .catch(errorHandler)
                .toArray()
                .subscribe((actions) => {
                    expect(errorHandler).toHaveBeenCalled();
                    expect(actions).toEqual([
                        { type: GiftCertificateActionType.RemoveGiftCertificateRequestedAction },
                        { type: GiftCertificateActionType.RemoveGiftCertificateFailed, payload: errorResponse, error: true },
                    ]);
                });
        });
    });
});
