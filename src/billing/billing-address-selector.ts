import { memoizeOne } from '@bigcommerce/memoize';

import { MissingDataError, MissingDataErrorType } from '../common/error/errors';
import { createSelector } from '../common/selector';
import { guard } from '../common/utility';

import BillingAddress from './billing-address';
import BillingAddressState, { DEFAULT_STATE } from './billing-address-state';

export default interface BillingAddressSelector {
    getBillingAddress(): BillingAddress | undefined;
    getBillingAddressOrThrow(): BillingAddress;
    getUpdateError(): Error | undefined;
    getContinueAsGuestError(): Error | undefined;
    getLoadError(): Error | undefined;
    isUpdating(): boolean;
    isContinuingAsGuest(): boolean;
    isLoading(): boolean;
}

export type BillingAddressSelectorFactory = (state: BillingAddressState) => BillingAddressSelector;

export function createBillingAddressSelectorFactory(): BillingAddressSelectorFactory {
    const getBillingAddress = createSelector(
        (state: BillingAddressState) => state.data,
        data => () => data
    );

    const getBillingAddressOrThrow = createSelector(
        getBillingAddress,
        getBillingAddress => () => {
            return guard(getBillingAddress(), () => new MissingDataError(MissingDataErrorType.MissingBillingAddress));
        }
    );

    const getUpdateError = createSelector(
        (state: BillingAddressState) => state.errors.updateError,
        error => () => error
    );

    const getContinueAsGuestError = createSelector(
        (state: BillingAddressState) => state.errors.continueAsGuestError,
        error => () => error
    );

    const getLoadError = createSelector(
        (state: BillingAddressState) => state.errors.loadError,
        error => () => error
    );

    const isUpdating = createSelector(
        (state: BillingAddressState) => !!state.statuses.isUpdating,
        status => () => status
    );

    const isContinuingAsGuest = createSelector(
        (state: BillingAddressState) => !!state.statuses.isContinuingAsGuest,
        status => () => status
    );

    const isLoading = createSelector(
        (state: BillingAddressState) => !!state.statuses.isLoading,
        status => () => status
    );

    return memoizeOne((
        state: BillingAddressState = DEFAULT_STATE
    ): BillingAddressSelector => {
        return {
            getBillingAddress: getBillingAddress(state),
            getBillingAddressOrThrow: getBillingAddressOrThrow(state),
            getUpdateError: getUpdateError(state),
            getContinueAsGuestError: getContinueAsGuestError(state),
            getLoadError: getLoadError(state),
            isUpdating: isUpdating(state),
            isContinuingAsGuest: isContinuingAsGuest(state),
            isLoading: isLoading(state),
        };
    });
}
