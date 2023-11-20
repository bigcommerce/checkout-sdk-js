import { Action } from '@bigcommerce/data-store';

import PaymentMethod from './payment-method';
import PaymentMethodMeta from './payment-method-meta';

export enum PaymentMethodActionType {
    LoadPaymentMethodRequested = 'LOAD_PAYMENT_METHOD_REQUESTED',
    LoadPaymentMethodSucceeded = 'LOAD_PAYMENT_METHOD_SUCCEEDED',
    LoadPaymentMethodFailed = 'LOAD_PAYMENT_METHOD_FAILED',

    LoadPaymentMethodsRequested = 'LOAD_PAYMENT_METHODS_REQUESTED',
    LoadPaymentMethodsSucceeded = 'LOAD_PAYMENT_METHODS_SUCCEEDED',
    LoadPaymentMethodsFailed = 'LOAD_PAYMENT_METHODS_FAILED',

    LoadPaymentMethodsByIdsRequested = 'LOAD_PAYMENT_METHODS_BY_IDS_REQUESTED',
    LoadPaymentMethodsByIdsSucceeded = 'LOAD_PAYMENT_METHODS_BY_IDS_SUCCEEDED',
    LoadPaymentMethodsByIdsFailed = 'LOAD_PAYMENT_METHODS_BY_IDS_FAILED',
}

export type PaymentMethodAction = LoadPaymentMethodAction | LoadPaymentMethodsAction;

export type LoadPaymentMethodAction =
    | LoadPaymentMethodRequestedAction
    | LoadPaymentMethodSucceededAction
    | LoadPaymentMethodFailedAction;

export type LoadPaymentMethodsAction =
    | LoadPaymentMethodsRequestedAction
    | LoadPaymentMethodsSucceededAction
    | LoadPaymentMethodsFailedAction;

export type LoadPaymentMethodsByIdsAction =
    | LoadPaymentMethodsByIdsRequestedAction
    | LoadPaymentMethodsByIdsSucceededAction
    | LoadPaymentMethodsByIdsFailedAction;

export interface LoadPaymentMethodRequestedAction extends Action {
    type: PaymentMethodActionType.LoadPaymentMethodRequested;
}

export interface LoadPaymentMethodSucceededAction extends Action<PaymentMethod> {
    type: PaymentMethodActionType.LoadPaymentMethodSucceeded;
}

export interface LoadPaymentMethodFailedAction extends Action<Error> {
    type: PaymentMethodActionType.LoadPaymentMethodFailed;
}

export interface LoadPaymentMethodsRequestedAction extends Action {
    type: PaymentMethodActionType.LoadPaymentMethodsRequested;
}

export interface LoadPaymentMethodsSucceededAction
    extends Action<PaymentMethod[], PaymentMethodMeta> {
    type: PaymentMethodActionType.LoadPaymentMethodsSucceeded;
}

export interface LoadPaymentMethodsFailedAction extends Action<Error> {
    type: PaymentMethodActionType.LoadPaymentMethodsFailed;
}

export interface LoadPaymentMethodsByIdsRequestedAction extends Action {
    type: PaymentMethodActionType.LoadPaymentMethodsByIdsRequested;
}

export interface LoadPaymentMethodsByIdsSucceededAction
    extends Action<PaymentMethod[], PaymentMethodMeta> {
    type: PaymentMethodActionType.LoadPaymentMethodsByIdsSucceeded;
}

export interface LoadPaymentMethodsByIdsFailedAction extends Action<Error> {
    type: PaymentMethodActionType.LoadPaymentMethodsByIdsFailed;
}
