import { Action } from '@bigcommerce/data-store';

import { Checkout } from '../checkout';

export enum BillingAddressActionType {
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
    type: BillingAddressActionType.UpdateBillingAddressRequested;
}

export interface UpdateBillingAddressSucceeded extends Action<Checkout> {
    type: BillingAddressActionType.UpdateBillingAddressSucceeded;
}

export interface UpdateBillingAddressFailed extends Action<Error> {
    type: BillingAddressActionType.UpdateBillingAddressFailed;
}
