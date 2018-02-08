export default interface Address {
    id: string;
    firstName: string;
    lastName: string;
    company: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    province: string;
    provinceCode: string;
    postCode: string;
    country: string;
    countryCode: string;
    phone: string;
    type: string;
    customFields: Array<{
        fieldId: string;
        fieldValue: string;
    }>;
}
