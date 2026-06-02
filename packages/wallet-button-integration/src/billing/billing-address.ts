import { Omit } from '@bigcommerce/checkout-sdk/payment-integration-api';

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
    shouldSaveAddress: boolean;
}

export interface BillingAddressResponse extends Omit<AddressRequestBody, 'shouldSaveAddress'> {
    entityId: string;
}

export interface BillingAddressUpdateRequestBody extends AddressRequestBody {
    id: string;
}

export interface AddBillingAddressResponseBody {
    data: {
        checkout: {
            addCheckoutBillingAddress: {
                checkout: {
                    billingAddress: BillingAddressResponse;
                };
            };
        };
    };
}

export interface UpdateBillingAddressResponseBody {
    data: {
        checkout: {
            updateCheckoutBillingAddress: {
                checkout: {
                    billingAddress: BillingAddressResponse;
                };
            };
        };
    };
}
