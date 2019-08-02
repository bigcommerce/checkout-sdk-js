import { StorefrontErrorResponseBody } from '../common/error';
import { RequestError } from '../common/error/errors';
import { createSelector } from '../common/selector';
import { memoizeOne } from '../common/utility';

import GiftCertificate from './gift-certificate';
import GiftCertificateState, { DEFAULT_STATE } from './gift-certificate-state';

export default interface GiftCertificateSelector {
    getGiftCertificates(): GiftCertificate[] | undefined;
    getRemoveError(): RequestError<StorefrontErrorResponseBody> | undefined;
    getApplyError(): RequestError<StorefrontErrorResponseBody> | undefined;
    isApplying(): boolean;
    isRemoving(): boolean;
}

export type GiftCertificateSelectorFactory = (state: GiftCertificateState) => GiftCertificateSelector;

export function createGiftCertificateSelectorFactory(): GiftCertificateSelectorFactory {
    const getGiftCertificates = createSelector(
        (state: GiftCertificateState) => state.data,
        data => () => data
    );

    const getRemoveError = createSelector(
        (state: GiftCertificateState) => state.errors.removeGiftCertificateError,
        error => () => error
    );

    const getApplyError = createSelector(
        (state: GiftCertificateState) => state.errors.applyGiftCertificateError,
        error => () => error
    );

    const isApplying = createSelector(
        (state: GiftCertificateState) => !!state.statuses.isApplyingGiftCertificate,
        status => () => status
    );

    const isRemoving = createSelector(
        (state: GiftCertificateState) => !!state.statuses.isRemovingGiftCertificate,
        status => () => status
    );

    return memoizeOne((
        state: GiftCertificateState = DEFAULT_STATE
    ): GiftCertificateSelector => {
        return {
            getGiftCertificates: getGiftCertificates(state),
            getRemoveError: getRemoveError(state),
            getApplyError: getApplyError(state),
            isApplying: isApplying(state),
            isRemoving: isRemoving(state),
        };
    });
}
