import { Action } from '@bigcommerce/data-store';

import Customer from '../customer';

export enum HeadlessCustomerActionType {
    GetCustomerRequested = 'GET_CUSTOMER_REQUESTED',
    GetCustomerSucceeded = 'GET_CUSTOMER_SUCCEEDED',
    GetCustomerFailed = 'GET_CUSTOMER_FAILED',
}

export type GetCustomerAction =
    | GetCustomerRequestedAction
    | GetCustomerSucceededAction
    | GetCustomerFailedAction;

export interface GetCustomerRequestedAction extends Action {
    type: HeadlessCustomerActionType.GetCustomerRequested;
}

export interface GetCustomerSucceededAction extends Action<Customer> {
    type: HeadlessCustomerActionType.GetCustomerSucceeded;
}

export interface GetCustomerFailedAction extends Action<Error> {
    type: HeadlessCustomerActionType.GetCustomerFailed;
}
