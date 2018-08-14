import { createAction, createErrorAction } from '@bigcommerce/data-store';

import { CheckoutActionType } from '../checkout';
import { getCheckout, getCheckoutWithGiftCertificates } from '../checkout/checkouts.mock';
import { RequestError } from '../common/error/errors';
import { getErrorResponse } from '../common/http-request/responses.mock';
import { ConsignmentActionType } from '../shipping';

import { GiftCertificateActionType } from './gift-certificate-actions';
import giftCertificateReducer from './gift-certificate-reducer';
import GiftCertificateState from './gift-certificate-state';

describe('giftCertificateReducer()', () => {
    const initialState: GiftCertificateState = { errors: {}, statuses: {} };

    it('returns new state when gift certificate gets applied', () => {
        const action = createAction(GiftCertificateActionType.ApplyGiftCertificateSucceeded, getCheckoutWithGiftCertificates());

        expect(giftCertificateReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload && action.payload.giftCertificates,
        }));
    });

    it('returns new state when gift certificate gets removed', () => {
        const action = createAction(GiftCertificateActionType.RemoveGiftCertificateSucceeded, getCheckout());

        expect(giftCertificateReducer(initialState, action)).toEqual(expect.objectContaining({
            data: [],
        }));
    });

    it('returns new state when consignment gets updated', () => {
        const action = createAction(ConsignmentActionType.UpdateConsignmentSucceeded, getCheckoutWithGiftCertificates(), { id: '123' });

        expect(giftCertificateReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload && action.payload.giftCertificates,
        }));
    });

    it('returns new state when consignment gets created', () => {
        const action = createAction(ConsignmentActionType.CreateConsignmentsSucceeded, getCheckoutWithGiftCertificates(), { id: '123' });

        expect(giftCertificateReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload && action.payload.giftCertificates,
        }));
    });

    it('returns new state when consignment gets deleted', () => {
        const action = createAction(ConsignmentActionType.DeleteConsignmentSucceeded, getCheckoutWithGiftCertificates(), { id: '123' });

        expect(giftCertificateReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload && action.payload.giftCertificates,
        }));
    });

    it('returns new state when shipping option gets updated', () => {
        const action = createAction(ConsignmentActionType.UpdateShippingOptionSucceeded, getCheckoutWithGiftCertificates(), { id: '123' });

        expect(giftCertificateReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload && action.payload.giftCertificates,
        }));
    });

    it('returns new state when checkout gets loaded', () => {
        const action = createAction(CheckoutActionType.LoadCheckoutSucceeded, getCheckoutWithGiftCertificates());

        expect(giftCertificateReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload && action.payload.giftCertificates,
        }));
    });

    it('returns an error state if gift certificate failed to be applied', () => {
        const action = createErrorAction(GiftCertificateActionType.ApplyGiftCertificateFailed, new RequestError(getErrorResponse()));

        expect(giftCertificateReducer(initialState, action)).toEqual(expect.objectContaining({
            errors: { applyGiftCertificateError: action.payload },
            statuses: { isApplyingGiftCertificate: false },
        }));
    });

    it('returns an error state if gift certificate failed to be removed', () => {
        const action = createErrorAction(GiftCertificateActionType.RemoveGiftCertificateFailed, new RequestError(getErrorResponse()));

        expect(giftCertificateReducer(initialState, action)).toEqual(expect.objectContaining({
            errors: { removeGiftCertificateError: action.payload },
            statuses: { isRemovingGiftCertificate: false },
        }));
    });

    it('returns new state while applying a gift certificate', () => {
        const action = createAction(GiftCertificateActionType.ApplyGiftCertificateRequested);

        expect(giftCertificateReducer(initialState, action)).toEqual(expect.objectContaining({
            statuses: { isApplyingGiftCertificate: true },
        }));
    });

    it('returns new state while removing a giftCertificate', () => {
        const action = createAction(GiftCertificateActionType.RemoveGiftCertificateRequested);

        expect(giftCertificateReducer(initialState, action)).toEqual(expect.objectContaining({
            statuses: { isRemovingGiftCertificate: true },
        }));
    });
});
