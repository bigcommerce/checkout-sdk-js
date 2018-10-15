export default interface Address extends AddressRequestBody {
    country: string;
}

export interface AddressRequestBody {
    firstName: string;
    lastName: string;
    company: string;
    address1: string;
    address2: string | null;
    city: string;
    stateOrProvince: string;
    stateOrProvinceCode: string;
    countryCode: string | null;
    postalCode: string;
    phone: string;
    customFields: Array<{
        fieldId: string;
        fieldValue: string;
    }>;
}
