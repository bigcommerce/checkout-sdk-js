import { Action } from '@bigcommerce/data-store';

export enum PaymentProviderAuthenticationType {
    UpdatePaymentProviderAuthentication = 'UPDATE_PAYMENT_PROVIDER_AUTHENTICATION',
}

export type PaymentProviderAuthenticationAction = UpdatePaymentProviderAuthenticationAction;

export interface UpdatePaymentProviderAuthenticationAction extends Action {
    type: PaymentProviderAuthenticationType.UpdatePaymentProviderAuthentication;
}
