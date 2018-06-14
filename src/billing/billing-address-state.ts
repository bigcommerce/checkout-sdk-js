import { Address } from '../address';

export default interface BillingAddressState {
    data?: Address;
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
