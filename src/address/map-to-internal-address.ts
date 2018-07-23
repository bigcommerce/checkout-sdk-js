import { isBillingAddressLike } from '../billing';
import BillingAddress from '../billing/billing-address';
import { Consignment } from '../shipping';

import Address from './address';
import InternalAddress from './internal-address';

export default function mapToInternalAddress(address: Address | BillingAddress, consignments?: Consignment[]): InternalAddress {
    let addressId;

    if (isBillingAddressLike(address)) {
        addressId = address.id;
    } else if (consignments && consignments.length) {
        addressId = consignments[0].id;
    }

    return {
        id: addressId,
        firstName: address.firstName,
        lastName: address.lastName,
        company: address.company,
        addressLine1: address.address1,
        addressLine2: address.address2,
        city: address.city,
        province: address.stateOrProvince,
        provinceCode: address.stateOrProvinceCode,
        postCode: address.postalCode,
        country: address.country,
        countryCode: address.countryCode,
        phone: address.phone,
        customFields: address.customFields,
    };
}
