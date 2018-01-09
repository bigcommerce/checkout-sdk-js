import { getGiftCertificateResponseBody } from './gift-certificate.mock';
import { getErrorResponseBody } from '../common/http-request/responses.mock';
import * as giftCertificateActionTypes from '../coupon/gift-certificate-action-types';
import giftCertificateReducer from './gift-certificate-reducer';

describe('giftCertificateReducer()', () => {
    let initialState;

    beforeEach(() => {
        initialState = {};
    });

    it('no data gets stored when a gift certificate is applied', () => {
        const response = getGiftCertificateResponseBody();
        const action = {
            type: giftCertificateActionTypes.APPLY_GIFT_CERTIFICATE_SUCCEEDED,
            meta: response.meta,
            payload: response.data,
        };

        expect(giftCertificateReducer(initialState, action)).not.toEqual(expect.objectContaining({
            data: {},
        }));
    });


    it('no data gets stored when a gift certificate is removed', () => {
        const response = getGiftCertificateResponseBody();
        const action = {
            type: giftCertificateActionTypes.REMOVE_GIFT_CERTIFICATE_SUCCEEDED,
            meta: response.meta,
            payload: response.data,
        };

        expect(giftCertificateReducer(initialState, action)).not.toEqual(expect.objectContaining({
            data: {},
        }));
    });


    it('returns an error state if gift certificate failed to be applied', () => {
        const action = {
            type: giftCertificateActionTypes.APPLY_GIFT_CERTIFICATE_FAILED,
            payload: getErrorResponseBody(),
        };

        expect(giftCertificateReducer(initialState, action)).toEqual(expect.objectContaining({
            errors: { applyGiftCertificateError: getErrorResponseBody() },
            statuses: { isApplyingGiftCertificate: false },
        }));
    });

    it('returns an error state if gift certificate failed to be removed', () => {
        const action = {
            type: giftCertificateActionTypes.REMOVE_GIFT_CERTIFICATE_FAILED,
            payload: getErrorResponseBody(),
        };

        expect(giftCertificateReducer(initialState, action)).toEqual(expect.objectContaining({
            errors: { removeGiftCertificateError: getErrorResponseBody() },
            statuses: { isRemovingGiftCertificate: false },
        }));
    });

    it('returns new state while applying a gift certificate', () => {
        const action = {
            type: giftCertificateActionTypes.APPLY_GIFT_CERTIFICATE_REQUESTED,
        };

        expect(giftCertificateReducer(initialState, action)).toEqual(expect.objectContaining({
            statuses: { isApplyingGiftCertificate: true },
        }));
    });

    it('returns new state while removing a giftCertificate', () => {
        const action = {
            type: giftCertificateActionTypes.REMOVE_GIFT_CERTIFICATE_REQUESTED,
        };

        expect(giftCertificateReducer(initialState, action)).toEqual(expect.objectContaining({
            statuses: { isRemovingGiftCertificate: true },
        }));
    });
});
