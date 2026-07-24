import { AddressExtraFieldValue } from '../form';

export type AddressKey = keyof Address;

export default interface Address extends AddressRequestBody {
    country: string;
}

export interface AddressRequestBody {
    shouldSaveAddress?: boolean;
    firstName: string;
    lastName: string;
    company: string;
    address1: string;
    address2: string;
    city: string;
    stateOrProvince: string;
    stateOrProvinceCode: string;
    countryCode: string;
    postalCode: string;
    phone: string;
    customFields: Array<{
        fieldId: string;
        fieldValue: string | number | string[];
    }>;
    extraFields?: AddressExtraFieldValue[];
    label?: string;
}
