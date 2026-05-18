import { Action } from '@bigcommerce/data-store';

import B2BCompanyPaymentMethod from './b2b-company-payment-method';

export enum B2BCompanyPaymentMethodActionType {
    LoadB2BCompanyPaymentMethodsRequested = 'LOAD_B2B_COMPANY_PAYMENT_METHODS_REQUESTED',
    LoadB2BCompanyPaymentMethodsSucceeded = 'LOAD_B2B_COMPANY_PAYMENT_METHODS_SUCCEEDED',
    LoadB2BCompanyPaymentMethodsFailed = 'LOAD_B2B_COMPANY_PAYMENT_METHODS_FAILED',
}

export type LoadB2BCompanyPaymentMethodsAction =
    | LoadB2BCompanyPaymentMethodsRequestedAction
    | LoadB2BCompanyPaymentMethodsSucceededAction
    | LoadB2BCompanyPaymentMethodsFailedAction;

export interface LoadB2BCompanyPaymentMethodsRequestedAction extends Action {
    type: B2BCompanyPaymentMethodActionType.LoadB2BCompanyPaymentMethodsRequested;
}

export interface LoadB2BCompanyPaymentMethodsSucceededAction
    extends Action<B2BCompanyPaymentMethod[]> {
    type: B2BCompanyPaymentMethodActionType.LoadB2BCompanyPaymentMethodsSucceeded;
}

export interface LoadB2BCompanyPaymentMethodsFailedAction extends Action<Error> {
    type: B2BCompanyPaymentMethodActionType.LoadB2BCompanyPaymentMethodsFailed;
}
