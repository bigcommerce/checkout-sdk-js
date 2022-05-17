import BillingAddress from './billing-address';

export default interface BillingAddressState {
    data?: BillingAddress;
    errors: BillingAddressErrorsState;
    statuses: BillingAddressStatusesState;
}

export interface BillingAddressErrorsState {
    loadError?: Error;
    updateError?: Error;
    continueAsGuestError?: Error;
}

export interface BillingAddressStatusesState {
    isLoading?: boolean;
    isUpdating?: boolean;
    isContinuingAsGuest?: boolean;
}

export const DEFAULT_STATE: BillingAddressState = {
    errors: {},
    statuses: {},
};
