import { Address, AddressRequestBody } from '../address';

export default interface BillingAddress extends Address {
    id: string;
    email?: string;
}

export interface BillingAddressUpdateRequestBody extends AddressRequestBody {
    id: string;
    email?: string;
}
