import { isBillingAddressLike, BillingAddress } from '../billing';
import { Consignment } from '../shipping';

import Address from './address';
import InternalAddress from './internal-address';

/**
 * @deprecated This mapper is only for internal use only. It is required during
 * the transition period as we are moving to adopt the new storefront API object
 * schema.
 */
export default function mapToInternalAddress(
    address: Address | BillingAddress,
    consignments?: Consignment[]
): InternalAddress<any> {
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
