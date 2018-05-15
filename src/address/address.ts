export default interface Address extends AddressRequestBody {
    country: string;
}

export interface AddressRequestBody {
    id?: string;
    email?: string;
    firstName: string;
    lastName: string;
    company: string;
    street1: string;
    street2: string;
    city: string;
    region: string;
    regionCode: string;
    countryCode: string;
    postalCode: string;
    phone: string;
    customFields: Array<{
        fieldId: string;
        fieldValue: string;
    }>;
}
