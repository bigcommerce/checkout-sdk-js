import { Action } from '@bigcommerce/data-store';

import { LoadCheckoutAction } from '../checkout';

import { InternalCustomerResponseData } from './internal-customer-responses';

export enum CustomerActionType {
    SignInCustomerRequested = 'SIGN_IN_CUSTOMER_REQUESTED',
    SignInCustomerSucceeded = 'SIGN_IN_CUSTOMER_SUCCEEDED',
    SignInCustomerFailed = 'SIGN_IN_CUSTOMER_FAILED',

    SignOutCustomerRequested = 'SIGN_OUT_CUSTOMER_REQUESTED',
    SignOutCustomerSucceeded = 'SIGN_OUT_CUSTOMER_SUCCEEDED',
    SignOutCustomerFailed = 'SIGN_OUT_CUSTOMER_FAILED',

    CreateCustomerRequested = 'CREATE_CUSTOMER_REQUESTED',
    CreateCustomerSucceeded = 'CREATE_CUSTOMER_SUCCEEDED',
    CreateCustomerFailed = 'CREATE_CUSTOMER_FAILED',
}

export type CustomerAction =
    SignInCustomerAction |
    SignOutCustomerAction |
    CreateCustomerAction;

export type CreateCustomerAction =
    CreateCustomerRequestedAction |
    CreateCustomerSucceededAction |
    CreateCustomerFailedAction |
    LoadCheckoutAction;

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

export interface CreateCustomerRequestedAction extends Action {
    type: CustomerActionType.CreateCustomerRequested;
}

export interface CreateCustomerSucceededAction extends Action {
    type: CustomerActionType.CreateCustomerSucceeded;
}

export interface CreateCustomerFailedAction extends Action<Error> {
    type: CustomerActionType.CreateCustomerFailed;
}
