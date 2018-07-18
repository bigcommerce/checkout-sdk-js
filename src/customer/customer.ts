import { CustomerAddress } from '../address/address';

export default interface Customer {
    id: number;
    addresses: CustomerAddress[];
    storeCredit: number;
    email: string;
    firstName: string;
    fullName: string;
    isGuest: boolean;
    lastName: string;
}
