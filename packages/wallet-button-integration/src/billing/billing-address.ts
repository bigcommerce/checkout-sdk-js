export interface BillingAddressResponseBody {
    data: {
        site: {
            checkout: {
                billingAddress: BillingAddressResponse;
            };
        };
    };
}

export interface BillingAddressResponse extends AddressRequestBody {
    entityId: string;
}

export interface BillingAddressUpdateRequestBody extends AddressRequestBody {
    id: string;
}

export interface AddressRequestBody {
    firstName: string;
    lastName: string;
    company: string;
    address1: string;
    address2: string;
    city: string;
    email: string;
    stateOrProvince: string;
    stateOrProvinceCode: string;
    countryCode: string;
    postalCode: string;
    phone: string;
}
