import { Address } from '../address';

export interface OrderBillingAddress extends Address {
    email?: string;
}

export default interface OrderBillingAddressState {
    data?: OrderBillingAddress;
}

export const DEFAULT_STATE: OrderBillingAddressState = {};
