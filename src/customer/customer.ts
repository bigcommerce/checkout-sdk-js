import { Address } from '../address';

export default interface Customer {
    addresses: Address[];
    email: string;
    firstName: string;
    fullName: string;
    isGuest: boolean;
    lastName: string;
}
