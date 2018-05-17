import { getErrorResponse } from '../common/http-request/responses.mock';

import { GiftCertificateActionType } from './gift-certificate-actions';
import giftCertificateReducer from './gift-certificate-reducer';
import { getGiftCertificateResponseBody } from './internal-gift-certificates.mock';

describe('giftCertificateReducer()', () => {
    let initialState;

    beforeEach(() => {
        initialState = {};
    });

    it('no data gets stored when a gift certificate is applied', () => {
        const response = getGiftCertificateResponseBody();
        const action = {
            type: GiftCertificateActionType.ApplyGiftCertificateSucceeded,
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
            type: GiftCertificateActionType.RemoveGiftCertificateSucceeded,
            meta: response.meta,
            payload: response.data,
        };

        expect(giftCertificateReducer(initialState, action)).not.toEqual(expect.objectContaining({
            data: {},
        }));
    });

    it('returns an error state if gift certificate failed to be applied', () => {
        const action = {
            type: GiftCertificateActionType.ApplyGiftCertificateFailed,
            payload: getErrorResponse(),
        };

        expect(giftCertificateReducer(initialState, action)).toEqual(expect.objectContaining({
            errors: { applyGiftCertificateError: getErrorResponse() },
            statuses: { isApplyingGiftCertificate: false },
        }));
    });

    it('returns an error state if gift certificate failed to be removed', () => {
        const action = {
            type: GiftCertificateActionType.RemoveGiftCertificateFailed,
            payload: getErrorResponse(),
        };

        expect(giftCertificateReducer(initialState, action)).toEqual(expect.objectContaining({
            errors: { removeGiftCertificateError: getErrorResponse() },
            statuses: { isRemovingGiftCertificate: false },
        }));
    });

    it('returns new state while applying a gift certificate', () => {
        const action = {
            type: GiftCertificateActionType.ApplyGiftCertificateRequested,
        };

        expect(giftCertificateReducer(initialState, action)).toEqual(expect.objectContaining({
            statuses: { isApplyingGiftCertificate: true },
        }));
    });

    it('returns new state while removing a giftCertificate', () => {
        const action = {
            type: GiftCertificateActionType.RemoveGiftCertificateRequested,
        };

        expect(giftCertificateReducer(initialState, action)).toEqual(expect.objectContaining({
            statuses: { isRemovingGiftCertificate: true },
        }));
    });
});
