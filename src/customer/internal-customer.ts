import { InternalAddress } from '../address';

export default interface InternalCustomer {
    addresses: InternalAddress[];
    customerId: number;
    isGuest: boolean;
    storeCredit: number;
    email: string;
    firstName: string;
    name: string;
    remote?: {
        billing: string;
        billingMessage: string;
        customer: string;
        customerMessage: string;
        payment: string;
        provider: string;
        shipping: string;
        useStoreCredit: boolean;
    };
    customerGroupId?: number;
    customerGroupName?: string;
    phoneNumber?: string;
}
