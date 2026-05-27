import { Action } from '@bigcommerce/data-store';

export enum B2BPaymentsRefreshActionType {
    RefreshB2BPaymentMethodsRequested = 'REFRESH_B2B_PAYMENT_METHODS_REQUESTED',
    RefreshB2BPaymentMethodsSucceeded = 'REFRESH_B2B_PAYMENT_METHODS_SUCCEEDED',
    RefreshB2BPaymentMethodsFailed = 'REFRESH_B2B_PAYMENT_METHODS_FAILED',
}

export type RefreshB2BPaymentMethodsAction =
    | RefreshB2BPaymentMethodsRequestedAction
    | RefreshB2BPaymentMethodsSucceededAction
    | RefreshB2BPaymentMethodsFailedAction;

export interface RefreshB2BPaymentMethodsRequestedAction extends Action {
    type: B2BPaymentsRefreshActionType.RefreshB2BPaymentMethodsRequested;
}

export interface RefreshB2BPaymentMethodsSucceededAction extends Action {
    type: B2BPaymentsRefreshActionType.RefreshB2BPaymentMethodsSucceeded;
}

export interface RefreshB2BPaymentMethodsFailedAction extends Action<Error> {
    type: B2BPaymentsRefreshActionType.RefreshB2BPaymentMethodsFailed;
}
