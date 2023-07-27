import { PaymentProviderCustomer } from './payment-provider-customer';

export default interface PaymentProviderCustomerState {
    data: PaymentProviderCustomer;
}

export const DEFAULT_STATE = {
    data: {},
};
