import { PaymentProviderCustomer } from './payment-provider-customer';

export default interface PaymentProviderCustomerState<T = any> {
    data: PaymentProviderCustomer<T>;
}

export const DEFAULT_STATE = {
    data: {},
};
