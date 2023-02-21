import { LegacyAddress } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { BraintreeDetails } from '../../../payment/strategies/braintree';

export default function mapToLegacyShippingAddress(
    details: BraintreeDetails,
): Partial<LegacyAddress> {
    const { email, phone, shippingAddress } = details;

    const recipientName = shippingAddress?.recipientName || '';
    const [firstName, lastName] = recipientName.split(' ');

    return {
        email,
        first_name: firstName || '',
        last_name: lastName || '',
        phone_number: phone,
        address_line_1: shippingAddress?.line1,
        address_line_2: shippingAddress?.line2,
        city: shippingAddress?.city,
        state: shippingAddress?.state,
        country_code: shippingAddress?.countryCode,
        postal_code: shippingAddress?.postalCode,
    };
}
