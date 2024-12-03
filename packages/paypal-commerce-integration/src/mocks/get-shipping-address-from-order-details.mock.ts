import { BillingAddressRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';

import getPayPalCommerceOrderDetails from './get-paypal-commerce-order-details.mock';

export default function getShippingAddressFromOrderDetails(): BillingAddressRequestBody {
    const orderDetails = getPayPalCommerceOrderDetails();

    const { payer, purchase_units } = orderDetails;
    const shippingAddress = purchase_units[0]?.shipping?.address || {};

    return {
        firstName: payer.name.given_name,
        lastName: payer.name.surname,
        email: payer.email_address,
        phone: '',
        company: '',
        address1: shippingAddress.address_line_1,
        address2: shippingAddress.address_line_2,
        city: shippingAddress.admin_area_2,
        countryCode: shippingAddress.country_code,
        postalCode: shippingAddress.postal_code,
        stateOrProvince: '',
        stateOrProvinceCode: shippingAddress.admin_area_1 || '',
        customFields: [],
    };
}
