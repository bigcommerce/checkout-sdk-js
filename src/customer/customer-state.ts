import Customer from './customer';

export default interface CustomerState {
    data?: Customer;
    statuses: CustomerStatusesState;
    errors: CustomerErrorsState;
}

export interface CustomerErrorsState {
    createError?: Error;
    createAddressError?: Error;
}

export interface CustomerStatusesState {
    isCreating?: boolean;
    isCreatingAddress?: boolean;
}

export const DEFAULT_STATE: CustomerState = {
    errors: {},
    statuses: {},
};
