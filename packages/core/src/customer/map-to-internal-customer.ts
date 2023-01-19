import { mapToInternalAddress } from '../address';
import { OrderBillingAddress } from '../order-billing-address/order-billing-address-state';

import InternalCustomer from './internal-customer';

import { Customer } from '.';

/**
 * @deprecated This mapper is only for internal use only. It is required during
 * the transition period as we are moving to adopt the new storefront API object
 * schema.
 */
export default function mapToInternalCustomer(
    customer: Customer,
    billingAddress: OrderBillingAddress,
): InternalCustomer {
    const firstName = customer.firstName || billingAddress.firstName || '';
    const lastName = customer.lastName || billingAddress.lastName || '';

    return {
        addresses: (customer.addresses || []).map((address) => mapToInternalAddress(address)),
        customerId: customer.id,
        isGuest: customer.isGuest,
        storeCredit: customer.storeCredit,
        email: customer.email || billingAddress.email || '',
        firstName,
        lastName,
        name: customer.fullName || [firstName, lastName].join(' '),
        customerGroupName: customer.customerGroup && customer.customerGroup.name,
    };
}
