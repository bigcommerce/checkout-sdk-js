import { mapToInternalAddress, Address } from '../address';

import { Customer } from '.';
import InternalCustomer from './internal-customer';

export default function mapToInternalCustomer(customer: Customer, billingAddress?: Address): InternalCustomer {
    return {
        addresses: (customer.addresses || []).map(address => mapToInternalAddress(address)),
        customerId: customer.id,
        isGuest: customer.isGuest,
        storeCredit: customer.storeCredit,
        email: customer.email || (billingAddress && billingAddress.email) || '',
        firstName: customer.firstName,
        name: customer.fullName,
    };
}
