import Address from './address';
import InternalAddress from './internal-address';

export default function mapFromInternalAddress(address: InternalAddress): Address {
    return {
        id: address.id,
        firstName: address.firstName,
        lastName: address.lastName,
        company: address.company,
        street1: address.addressLine1,
        street2: address.addressLine2,
        city: address.city,
        region: address.province,
        regionCode: address.provinceCode,
        postalCode: address.postCode,
        country: address.country,
        countryCode: address.countryCode,
        phone: address.phone,
        customFields: address.customFields,
    };
}
