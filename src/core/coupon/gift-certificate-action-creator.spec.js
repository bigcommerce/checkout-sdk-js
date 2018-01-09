import { Observable } from 'rxjs';
import { getGiftCertificateResponseBody } from './gift-certificate.mock';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';
import * as actionTypes from './gift-certificate-action-types';
import createCheckoutStore from '../create-checkout-store';
import GiftCertificateActionCreator from './gift-certificate-action-creator';

describe('GiftCertificateActionCreator', () => {
    let checkoutClient;
    let errorResponse;
    let giftCertificateActionCreator;
    let response;
    let store;

    beforeEach(() => {
        response = getResponse(getGiftCertificateResponseBody());
        errorResponse = getErrorResponse();
        store = createCheckoutStore();

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

            giftCertificateActionCreator.applyGiftCertificate(giftCertificate)
                .toArray()
                .subscribe((actions) => {
                    expect(actions).toEqual([
                        { type: actionTypes.APPLY_GIFT_CERTIFICATE_REQUESTED },
                        { type: actionTypes.APPLY_GIFT_CERTIFICATE_SUCCEEDED, payload: response.body.data },
                    ]);
                });
        });

        it('emits error actions if unable to apply giftCertificate', () => {
            checkoutClient.applyGiftCertificate.mockReturnValue(Promise.reject(errorResponse));

            const giftCertificate = 'myGiftCertificate1234';
            const errorHandler = jest.fn((action) => Observable.of(action));

            giftCertificateActionCreator.applyGiftCertificate(giftCertificate)
                .catch(errorHandler)
                .toArray()
                .subscribe((actions) => {
                    expect(errorHandler).toHaveBeenCalled();
                    expect(actions).toEqual([
                        { type: actionTypes.APPLY_GIFT_CERTIFICATE_REQUESTED },
                        { type: actionTypes.APPLY_GIFT_CERTIFICATE_FAILED, payload: errorResponse, error: true },
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

            giftCertificateActionCreator.removeGiftCertificate(giftCertificate)
                .toArray()
                .subscribe((actions) => {
                    expect(actions).toEqual([
                        { type: actionTypes.REMOVE_GIFT_CERTIFICATE_REQUESTED },
                        { type: actionTypes.REMOVE_GIFT_CERTIFICATE_SUCCEEDED, payload: response.body.data },
                    ]);
                });
        });

        it('emits error actions if unable to remove giftCertificate', () => {
            checkoutClient.removeGiftCertificate.mockReturnValue(Promise.reject(errorResponse));

            const giftCertificate = 'myGiftCertificate1234';
            const errorHandler = jest.fn((action) => Observable.of(action));

            giftCertificateActionCreator.removeGiftCertificate(giftCertificate)
                .catch(errorHandler)
                .toArray()
                .subscribe((actions) => {
                    expect(errorHandler).toHaveBeenCalled();
                    expect(actions).toEqual([
                        { type: actionTypes.REMOVE_GIFT_CERTIFICATE_REQUESTED },
                        { type: actionTypes.REMOVE_GIFT_CERTIFICATE_FAILED, payload: errorResponse, error: true },
                    ]);
                });
        });
    });
});
