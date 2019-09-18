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
