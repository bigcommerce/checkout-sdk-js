import { Address, AddressRequestBody } from '../address';

export default interface BillingAddress extends Address {
    id: string;
    email?: string;
}

export interface BillingAddressRequestBody extends AddressRequestBody {
    email?: string;
}

export interface BillingAddressUpdateRequestBody extends BillingAddressRequestBody {
    id: string;
}
