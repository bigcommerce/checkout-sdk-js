import { Action } from '@bigcommerce/data-store';

import { PaymentMethodsResponseData, PaymentMethodResponseData } from './payment-method-responses';

export enum PaymentMethodActionType {
    LoadPaymentMethodRequested = 'LOAD_PAYMENT_METHOD_REQUESTED',
    LoadPaymentMethodSucceeded = 'LOAD_PAYMENT_METHOD_SUCCEEDED',
    LoadPaymentMethodFailed = 'LOAD_PAYMENT_METHOD_FAILED',

    LoadPaymentMethodsRequested = 'LOAD_PAYMENT_METHODS_REQUESTED',
    LoadPaymentMethodsSucceeded = 'LOAD_PAYMENT_METHODS_SUCCEEDED',
    LoadPaymentMethodsFailed = 'LOAD_PAYMENT_METHODS_FAILED',
}

export type PaymentMethodAction = LoadPaymentMethodAction | LoadPaymentMethodsAction;

export type LoadPaymentMethodAction =
    LoadPaymentMethodRequestedAction |
    LoadPaymentMethodSucceededAction |
    LoadPaymentMethodFailedAction;

export type LoadPaymentMethodsAction =
    LoadPaymentMethodsRequestedAction |
    LoadPaymentMethodsSucceededAction |
    LoadPaymentMethodsFailedAction;

export interface LoadPaymentMethodRequestedAction extends Action {
    type: PaymentMethodActionType.LoadPaymentMethodRequested;
}

export interface LoadPaymentMethodSucceededAction extends Action<PaymentMethodResponseData> {
    type: PaymentMethodActionType.LoadPaymentMethodSucceeded;
}

export interface LoadPaymentMethodFailedAction extends Action<Error> {
    type: PaymentMethodActionType.LoadPaymentMethodFailed;
}

export interface LoadPaymentMethodsRequestedAction extends Action {
    type: PaymentMethodActionType.LoadPaymentMethodsRequested;
}

export interface LoadPaymentMethodsSucceededAction extends Action<PaymentMethodsResponseData> {
    type: PaymentMethodActionType.LoadPaymentMethodsSucceeded;
}

export interface LoadPaymentMethodsFailedAction extends Action<Error> {
    type: PaymentMethodActionType.LoadPaymentMethodsFailed;
}
