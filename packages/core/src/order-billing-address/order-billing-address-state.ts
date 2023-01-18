import { BillingAddress } from '../billing';

export type OrderBillingAddress = Omit<BillingAddress, 'id'>;

export default interface OrderBillingAddressState {
    data?: OrderBillingAddress;
}

export const DEFAULT_STATE: OrderBillingAddressState = {};
