import { mapToInternalAddress } from '../address';
import { Checkout } from '../checkout';

import InternalCustomer from './internal-customer';

export default function mapToInternalCustomer(checkout: Checkout): InternalCustomer {
    return {
        addresses: checkout.customer.addresses.map(address => mapToInternalAddress(address)),
        customerId: checkout.cart.customerId,
        isGuest: checkout.customer.isGuest,
        storeCredit: checkout.customer.storeCredit,
        email: checkout.customer.email || (checkout.billingAddress && checkout.billingAddress.email) || '',
        firstName: checkout.customer.firstName,
        name: checkout.customer.fullName,
    };
}
