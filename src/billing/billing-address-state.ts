import { BillingAddress } from '../address/address';

export default interface BillingAddressState {
    data?: BillingAddress;
    errors: BillingAddressErrorsState;
    statuses: BillingAddressStatusesState;
}

export interface BillingAddressErrorsState {
    loadError?: Error;
    updateError?: Error;
}

export interface BillingAddressStatusesState {
    isLoading?: boolean;
    isUpdating?: boolean;
}
