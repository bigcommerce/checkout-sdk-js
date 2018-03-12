export default interface Address {
    id: string;
    firstName: string;
    lastName: string;
    company: string;
    street1: string;
    street2: string;
    city: string;
    region: string;
    regionCode: string;
    country: string;
    countryCode: string;
    postalCode: string;
    phone: string;
    customFields: Array<{
        fieldId: string;
        fieldValue: string;
    }>;
}
