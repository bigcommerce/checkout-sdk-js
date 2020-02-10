import { Address } from '../address';

export default interface Customer {
    id: number;
    addresses: CustomerAddress[];
    storeCredit: number;
    email: string;
    firstName: string;
    fullName: string;
    isGuest: boolean;
    lastName: string;
    customerGroup?: CustomerGroup;
}

export interface CustomerAddress extends Address {
    id: number;
    type: string;
}

export interface CustomerGroup  {
    id: number;
    name: string;
}

// todo: Eventually we should
// (1) Merge CurrentCustomer with Customer (once done in API first);
// (2) Rename `Customer` to `CheckoutCustomer` (breaking change)
export interface CurrentCustomer {
    email: string;
    acceptsMarketing: boolean;
}
