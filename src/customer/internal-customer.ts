import { InternalAddress } from '../address';

export default interface InternalCustomer {
    addresses: Array<InternalAddress<number>>;
    customerId: number;
    isGuest: boolean;
    storeCredit: number;
    email: string;
    firstName: string;
    lastName: string;
    name: string;
    remote?: {
        provider: string;
        billing?: string;
        billingMessage?: string;
        customer?: string;
        payment?: string;
        shipping?: string;
        customerMessage?: string;
        useStoreCredit?: boolean;
    };
    customerGroupId?: number;
    customerGroupName?: string;
    phoneNumber?: string;
}
