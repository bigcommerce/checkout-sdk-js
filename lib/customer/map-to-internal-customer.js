"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function mapToInternalCustomer(checkout, existingCustomer) {
    return {
        addresses: existingCustomer.addresses,
        customerId: checkout.cart.customerId,
        customerGroupId: existingCustomer.customerGroupId,
        customerGroupName: existingCustomer.customerGroupName,
        isGuest: existingCustomer.isGuest,
        phoneNumber: existingCustomer.phoneNumber,
        storeCredit: checkout.storeCredit,
        email: existingCustomer.email,
        firstName: existingCustomer.firstName,
        name: existingCustomer.name,
    };
}
exports.default = mapToInternalCustomer;
//# sourceMappingURL=map-to-internal-customer.js.map