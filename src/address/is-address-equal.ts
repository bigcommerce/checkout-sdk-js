import { identity, isEqual, pickBy } from 'lodash';

import Address from './address';

export default function isAddressEqual(addressA: Partial<Address>, addressB: Partial<Address>): boolean {
    return isEqual(normalize(addressA), normalize(addressB));
}

function normalize(address: Partial<Address>): Partial<Address> {
    return pickBy({
        firstName: address.firstName,
        lastName: address.lastName,
        company: address.company,
        address1: address.address1,
        address2: address.address2,
        city: address.city,
        stateOrProvince: address.stateOrProvince,
        countryCode: address.countryCode,
        postalCode: address.postalCode,
        phone: address.phone,
        customFields: address.customFields,
    }, identity);
}
