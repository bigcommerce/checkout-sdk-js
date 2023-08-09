import { Action } from '@bigcommerce/data-store';

export enum PaymentProviderCustomerType {
    UpdatePaymentProviderCustomer = 'UPDATE_PAYMENT_PROVIDER_CUSTOMER',
}

export type PaymentProviderCustomerAction = UpdatePaymentProviderCustomerAction;

export interface UpdatePaymentProviderCustomerAction extends Action {
    type: PaymentProviderCustomerType.UpdatePaymentProviderCustomer;
}
