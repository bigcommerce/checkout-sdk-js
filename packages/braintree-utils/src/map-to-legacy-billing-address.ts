import { LegacyAddress } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { BraintreeTokenizationDetails } from './types';

export default function mapToLegacyBillingAddress(
    details: BraintreeTokenizationDetails,
): Partial<LegacyAddress> {
    const { billingAddress, email, firstName, lastName, phone, shippingAddress } = details;

    const address = billingAddress || shippingAddress;

    return {
        email,
        first_name: firstName,
        last_name: lastName,
        phone_number: phone,
        address_line_1: address?.line1,
        address_line_2: address?.line2,
        city: address?.city,
        state: address?.state,
        country_code: address?.countryCode,
        postal_code: address?.postalCode,
    };
}
