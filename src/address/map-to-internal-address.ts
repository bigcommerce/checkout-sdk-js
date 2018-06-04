import Address from './address';
import InternalAddress from './internal-address';

export default function mapToInternalAddress(address: Address, id?: string): InternalAddress {
    return {
        id: id ? id : address.id,
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
