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
        provider: string;
        customerMessage?: string;
        useStoreCredit?: boolean;
    };
    customerGroupId?: number;
    customerGroupName?: string;
    phoneNumber?: string;
}
