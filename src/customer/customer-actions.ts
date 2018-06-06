import { Action } from '@bigcommerce/data-store';

import { InternalCheckout } from '../checkout';

export enum CustomerActionType {
    SignInCustomerRequested = 'SIGN_IN_CUSTOMER_REQUESTED',
    SignInCustomerSucceeded = 'SIGN_IN_CUSTOMER_SUCCEEDED',
    SignInCustomerFailed = 'SIGN_IN_CUSTOMER_FAILED',

    SignOutCustomerRequested = 'SIGN_OUT_CUSTOMER_REQUESTED',
    SignOutCustomerSucceeded = 'SIGN_OUT_CUSTOMER_SUCCEEDED',
    SignOutCustomerFailed = 'SIGN_OUT_CUSTOMER_FAILED',
}

export type CustomerAction =
    SignInCustomerAction |
    SignOutCustomerAction;

export type SignInCustomerAction =
    SignInCustomerRequestedAction |
    SignInCustomerSucceededAction |
    SignInCustomerFailedAction;

export type SignOutCustomerAction =
    SignOutCustomerRequestedAction |
    SignOutCustomerSucceededAction |
    SignOutCustomerFailedAction;

export interface SignInCustomerRequestedAction extends Action {
    type: CustomerActionType.SignInCustomerRequested;
}

export interface SignInCustomerSucceededAction extends Action<InternalCheckout> {
    type: CustomerActionType.SignInCustomerSucceeded;
}

export interface SignInCustomerFailedAction extends Action<Error> {
    type: CustomerActionType.SignInCustomerFailed;
}

export interface SignOutCustomerRequestedAction extends Action {
    type: CustomerActionType.SignOutCustomerRequested;
}

export interface SignOutCustomerSucceededAction extends Action<InternalCheckout> {
    type: CustomerActionType.SignOutCustomerSucceeded;
}

export interface SignOutCustomerFailedAction extends Action<Error> {
    type: CustomerActionType.SignOutCustomerFailed;
}
