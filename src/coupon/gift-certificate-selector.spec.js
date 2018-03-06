import { getErrorResponse } from '../common/http-request/responses.mock';
import GiftCertificateSelector from './gift-certificate-selector';

describe('GiftCertificateSelector', () => {
    let giftCertificateSelector;
    let state;

    beforeEach(() => {
        state = {};
    });

    describe('#getApplyError()', () => {
        it('returns error if unable to apply', () => {
            const applyGiftCertificateError = getErrorResponse();

            giftCertificateSelector = new GiftCertificateSelector({
                ...state.quote,
                errors: { applyGiftCertificateError },
            });

            expect(giftCertificateSelector.getApplyError()).toEqual(applyGiftCertificateError);
        });

        it('does not returns error if able to apply', () => {
            giftCertificateSelector = new GiftCertificateSelector(state.quote);

            expect(giftCertificateSelector.getApplyError()).toBeUndefined();
        });
    });

    describe('#isApplying()', () => {
        it('returns true if applying a gift certificate', () => {
            giftCertificateSelector = new GiftCertificateSelector({
                ...state.quote,
                statuses: { isApplyingGiftCertificate: true },
            });

            expect(giftCertificateSelector.isApplying()).toEqual(true);
        });

        it('returns false if not applying a gift certificate', () => {
            giftCertificateSelector = new GiftCertificateSelector(state.quote);

            expect(giftCertificateSelector.isApplying()).toEqual(false);
        });
    });

    describe('#getRemoveError()', () => {
        it('returns error if unable to remove', () => {
            const removeGiftCertificateError = getErrorResponse();

            giftCertificateSelector = new GiftCertificateSelector({
                ...state.quote,
                errors: { removeGiftCertificateError },
            });

            expect(giftCertificateSelector.getRemoveError()).toEqual(removeGiftCertificateError);
        });

        it('does not returns error if able to remove', () => {
            giftCertificateSelector = new GiftCertificateSelector(state.quote);

            expect(giftCertificateSelector.getRemoveError()).toBeUndefined();
        });
    });

    describe('#isRemoving()', () => {
        it('returns true if removing a gift certificate', () => {
            giftCertificateSelector = new GiftCertificateSelector({
                ...state.quote,
                statuses: { isRemovingGiftCertificate: true },
            });

            expect(giftCertificateSelector.isRemoving()).toEqual(true);
        });

        it('returns false if not removing a gift certificate', () => {
            giftCertificateSelector = new GiftCertificateSelector(state.quote);

            expect(giftCertificateSelector.isRemoving()).toEqual(false);
        });
    });
});
