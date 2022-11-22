import { Action } from "@bigcommerce/data-store";

import { Checkout } from "../checkout";

export enum BillingAddressActionType {
    UpdateBillingAddressRequested = "UPDATE_BILLING_ADDRESS_REQUESTED",
    UpdateBillingAddressSucceeded = "UPDATE_BILLING_ADDRESS_SUCCEEDED",
    UpdateBillingAddressFailed = "UPDATE_BILLING_ADDRESS_FAILED",

    ContinueAsGuestRequested = "CONTINUE_AS_GUEST_REQUESTED",
    ContinueAsGuestSucceeded = "CONTINUE_AS_GUEST_SUCCEEDED",
    ContinueAsGuestFailed = "CONTINUE_AS_GUEST_FAILED",

    DeleteBillingAddressRequested = "DELETE_BILLING_ADDRESS_REQUESTED",
    DeleteBillingAddressSucceeded = "DELETE_BILLING_ADDRESS_SUCCEEDED",
    DeleteBillingAddressFailed = "DELETE_BILLING_ADDRESS_FAILED",
}

export type BillingAddressAction =
    | ContinueAsGuestAction
    | UpdateBillingAddressAction;

export type UpdateBillingAddressAction =
    | UpdateBillingAddressRequested
    | UpdateBillingAddressSucceeded
    | UpdateBillingAddressFailed;

export type ContinueAsGuestAction =
    | ContinueAsGuestRequested
    | ContinueAsGuestSucceeded
    | ContinueAsGuestFailed;

export type DeleteBillingAddressAction =
    | DeleteBillingAddressRequested
    | DeleteBillingAddressSucceeded
    | DeleteBillingAddressFailed;

export interface UpdateBillingAddressRequested extends Action {
    type: BillingAddressActionType.UpdateBillingAddressRequested;
}

export interface UpdateBillingAddressSucceeded extends Action<Checkout> {
    type: BillingAddressActionType.UpdateBillingAddressSucceeded;
}

export interface UpdateBillingAddressFailed extends Action<Error> {
    type: BillingAddressActionType.UpdateBillingAddressFailed;
}

export interface ContinueAsGuestRequested extends Action {
    type: BillingAddressActionType.ContinueAsGuestRequested;
}

export interface ContinueAsGuestSucceeded extends Action<Checkout> {
    type: BillingAddressActionType.ContinueAsGuestSucceeded;
}

export interface ContinueAsGuestFailed extends Action<Error> {
    type: BillingAddressActionType.ContinueAsGuestFailed;
}

export interface DeleteBillingAddressRequested extends Action {
    type: BillingAddressActionType.DeleteBillingAddressRequested;
}

export interface DeleteBillingAddressSucceeded extends Action<Checkout> {
    type: BillingAddressActionType.DeleteBillingAddressSucceeded;
}

export interface DeleteBillingAddressFailed extends Action<Error> {
    type: BillingAddressActionType.DeleteBillingAddressFailed;
}
