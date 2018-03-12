import { InternalAddress } from '../address';

export default interface InternalCustomer {
    addresses: InternalAddress[];
    customerId: number;
    customerGroupId: number;
    customerGroupName: number;
    isGuest: boolean;
    phoneNumber: string;
    storeCredit: number;
    email: string;
    firstName: string;
    name: string;
}
