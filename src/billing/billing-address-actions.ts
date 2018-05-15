import { Action } from '@bigcommerce/data-store';

export enum BillingAddressActionTypes {
    UpdateBillingAddressRequested = 'UPDATE_BILLING_ADDRESS_REQUESTED',
    UpdateBillingAddressSucceeded = 'UPDATE_BILLING_ADDRESS_SUCCEEDED',
    UpdateBillingAddressFailed = 'UPDATE_BILLING_ADDRESS_FAILED',
}

export type BillingAddressAction =
    UpdateBillingAddressAction;

export type UpdateBillingAddressAction =
    UpdateBillingAddressRequested |
    UpdateBillingAddressSucceeded |
    UpdateBillingAddressFailed;

export interface UpdateBillingAddressRequested extends Action {
    type: BillingAddressActionTypes.UpdateBillingAddressRequested;
}

export interface UpdateBillingAddressSucceeded extends Action {
    type: BillingAddressActionTypes.UpdateBillingAddressSucceeded;
}

export interface UpdateBillingAddressFailed extends Action<Error> {
    type: BillingAddressActionTypes.UpdateBillingAddressFailed;
}
