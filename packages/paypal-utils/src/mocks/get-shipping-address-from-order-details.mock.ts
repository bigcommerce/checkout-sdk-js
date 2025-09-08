import { BillingAddressRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';

import getPayPalOrderDetails from './get-paypal-order-details.mock';

export default function getShippingAddressFromOrderDetails(): BillingAddressRequestBody {
    const orderDetails = getPayPalOrderDetails();

    const { payer, purchase_units } = orderDetails;
    const {
        address,
        name: { full_name },
    } = purchase_units[0].shipping;
    const [firstName, ...lastName] = full_name.split(' ');

    return {
        firstName,
        lastName: lastName.join(' '),
        email: payer.email_address,
        phone: '',
        company: '',
        address1: address.address_line_1,
        address2: address.address_line_2,
        city: address.admin_area_2,
        countryCode: address.country_code,
        postalCode: address.postal_code,
        stateOrProvince: '',
        stateOrProvinceCode: address.admin_area_1 || '',
        customFields: [],
    };
}
