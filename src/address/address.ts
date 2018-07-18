export default interface Address extends AddressRequestBody {
    country: string;
}

export interface BillingAddress extends Address {
    id: string;
    email?: string;
}

export interface CustomerAddress extends Address {
    id: string;
}

export interface AddressRequestBody {
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
        fieldValue: string;
    }>;
}

export interface BillingAddressUpdateRequestBody extends AddressRequestBody {
    id: string;
    email?: string;
}
