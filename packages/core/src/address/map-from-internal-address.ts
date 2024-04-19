import { BillingAddress } from '../billing';

import Address from './address';
import InternalAddress from './internal-address';

export default function mapFromInternalAddress(address: InternalAddress): Address | BillingAddress {
    return {
        id: address.id,
        firstName: address.firstName,
        lastName: address.lastName,
        company: address.company,
        address1: address.addressLine1,
        address2: address.addressLine2,
        city: address.city,
        stateOrProvince: address.province,
        stateOrProvinceCode: address.provinceCode,
        postalCode: address.postCode,
        country: address.country,
        countryCode: address.countryCode,
        phone: address.phone,
        customFields: address.customFields,
    };
}
