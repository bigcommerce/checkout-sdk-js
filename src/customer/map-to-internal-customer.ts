import { Checkout } from '../checkout';

import InternalCustomer from './internal-customer';

export default function mapToInternalCustomer(checkout: Checkout, existingCustomer: InternalCustomer): InternalCustomer {
    return {
        addresses: existingCustomer.addresses,
        customerId: checkout.cart.customerId,
        customerGroupId: existingCustomer.customerGroupId,
        customerGroupName: existingCustomer.customerGroupName,
        isGuest: existingCustomer.isGuest,
        phoneNumber: existingCustomer.phoneNumber,
        remote: existingCustomer.remote,
        storeCredit: checkout.storeCredit,
        email: existingCustomer.email,
        firstName: existingCustomer.firstName,
        name: existingCustomer.name,
    };
}
