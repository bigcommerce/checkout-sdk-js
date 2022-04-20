import { AddressRequestBody } from '../address';

export default interface CustomerAccountRequestBody {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    acceptsMarketingEmails?: boolean;
    customFields?: Array<{
        fieldId: string;
        fieldValue: string | number | string[];
    }>;
}

export interface CustomerAccountInternalRequestBody extends CustomerAccountRequestBody {
    token?: string;
}

export type CustomerAddressRequestBody = AddressRequestBody;
