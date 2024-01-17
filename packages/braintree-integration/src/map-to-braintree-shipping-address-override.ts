import { BraintreeShippingAddressOverride } from '@bigcommerce/checkout-sdk/braintree-utils';
import { Address } from '@bigcommerce/checkout-sdk/payment-integration-api';

export default function mapToBraintreeShippingAddressOverride(
    address: Address,
): BraintreeShippingAddressOverride {
    return {
        recipientName: `${address.firstName} ${address.lastName}`,
        line1: address.address1,
        line2: address.address2,
        city: address.city,
        state: address.stateOrProvinceCode,
        postalCode: address.postalCode,
        countryCode: address.countryCode,
        phone: address.phone,
    };
}
