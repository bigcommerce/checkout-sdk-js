import { mapToInternalAddress, Address } from '../address';

import { Customer } from '.';
import InternalCustomer from './internal-customer';

export default function mapToInternalCustomer(customer: Customer, billingAddress: Address): InternalCustomer {
    const firstName = customer.firstName || billingAddress.firstName || '';
    const lastName = customer.lastName || billingAddress.lastName || '';

    return {
        addresses: (customer.addresses || []).map(address => mapToInternalAddress(address)),
        customerId: customer.id,
        isGuest: customer.isGuest,
        storeCredit: customer.storeCredit,
        email: customer.email || billingAddress.email || '',
        firstName,
        lastName,
        name: customer.fullName || [firstName, lastName].join(' '),
    };
}
