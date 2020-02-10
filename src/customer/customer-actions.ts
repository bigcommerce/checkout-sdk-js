import { Action } from '@bigcommerce/data-store';

import { LoadCheckoutAction } from '../checkout';

import { CurrentCustomer } from './customer';
import { InternalCustomerResponseData } from './internal-customer-responses';

export enum CustomerActionType {
    SignInCustomerRequested = 'SIGN_IN_CUSTOMER_REQUESTED',
    SignInCustomerSucceeded = 'SIGN_IN_CUSTOMER_SUCCEEDED',
    SignInCustomerFailed = 'SIGN_IN_CUSTOMER_FAILED',

    SignOutCustomerRequested = 'SIGN_OUT_CUSTOMER_REQUESTED',
    SignOutCustomerSucceeded = 'SIGN_OUT_CUSTOMER_SUCCEEDED',
    SignOutCustomerFailed = 'SIGN_OUT_CUSTOMER_FAILED',

    UpdateCustomerRequested = 'UPDATE_CUSTOMER_REQUESTED',
    UpdateCustomerSucceeded = 'UPDATE_CUSTOMER_SUCCEEDED',
    UpdateCustomerFailed = 'UPDATE_CUSTOMER_FAILED',
}

export type CustomerAction =
    UpdateCustomerAction |
    SignInCustomerAction |
    SignOutCustomerAction;

export type SignInCustomerAction =
    SignInCustomerRequestedAction |
    SignInCustomerSucceededAction |
    SignInCustomerFailedAction |
    LoadCheckoutAction;

export type SignOutCustomerAction =
    SignOutCustomerRequestedAction |
    SignOutCustomerSucceededAction |
    SignOutCustomerFailedAction |
    LoadCheckoutAction;

export type UpdateCustomerAction =
    UpdateCustomerRequestedAction |
    UpdateCustomerSucceededAction |
    UpdateCustomerFailedAction;

export interface SignInCustomerRequestedAction extends Action {
    type: CustomerActionType.SignInCustomerRequested;
}

export interface SignInCustomerSucceededAction extends Action<InternalCustomerResponseData> {
    type: CustomerActionType.SignInCustomerSucceeded;
}

export interface SignInCustomerFailedAction extends Action<Error> {
    type: CustomerActionType.SignInCustomerFailed;
}

export interface SignOutCustomerRequestedAction extends Action {
    type: CustomerActionType.SignOutCustomerRequested;
}

export interface SignOutCustomerSucceededAction extends Action<InternalCustomerResponseData> {
    type: CustomerActionType.SignOutCustomerSucceeded;
}

export interface SignOutCustomerFailedAction extends Action<Error> {
    type: CustomerActionType.SignOutCustomerFailed;
}

export interface UpdateCustomerRequestedAction extends Action {
    type: CustomerActionType.UpdateCustomerRequested;
}

export interface UpdateCustomerSucceededAction extends Action<CurrentCustomer> {
    type: CustomerActionType.UpdateCustomerSucceeded;
}

export interface UpdateCustomerFailedAction extends Action<Error> {
    type: CustomerActionType.UpdateCustomerFailed;
}
