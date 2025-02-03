import { BillingAddressRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';

import getPayPalCommerceOrderDetails from './get-paypal-commerce-order-details.mock';

export default function getBillingAddressFromOrderDetails(): BillingAddressRequestBody {
    const { payer } = getPayPalCommerceOrderDetails();

    return {
        firstName: payer.name.given_name,
        lastName: payer.name.surname,
        email: payer.email_address,
        phone: payer.phone?.phone_number.national_number || '',
        company: '',
        address1: payer.address.address_line_1,
        address2: payer.address.address_line_2,
        city: payer.address.admin_area_2,
        countryCode: payer.address.country_code,
        postalCode: payer.address.postal_code,
        stateOrProvince: '',
        stateOrProvinceCode: payer.address.admin_area_1 || '',
        customFields: [],
    };
}
