import { Address } from '../../../address';

import { BraintreeAddress } from './braintree';

export default function mapToBraintreeAddress(address: Address): BraintreeAddress {
    return {
        firstName: address.firstName,
        lastName: address.lastName,
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
