"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function mapToInternalAddress(address, existingAddress) {
    return {
        id: address.id,
        firstName: address.firstName,
        lastName: address.lastName,
        company: address.company,
        addressLine1: address.street1,
        addressLine2: address.street2,
        city: address.city,
        province: address.region,
        provinceCode: address.regionCode,
        postCode: address.postalCode,
        country: address.country,
        countryCode: address.countryCode,
        phone: address.phone,
        type: existingAddress.type,
        customFields: address.customFields,
    };
}
exports.default = mapToInternalAddress;
//# sourceMappingURL=map-to-internal-address.js.map