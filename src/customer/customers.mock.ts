import { getShippingAddress } from '../shipping/shipping-addresses.mock';

import Customer from './customer';

export function getGuestCustomer(): Customer {
    return {
        addresses: [],
        email: 'test@bigcommerce.com',
        firstName: 'Foo',
        fullName: 'Foo Bar',
        isGuest: true,
        lastName: 'Bar',
    };
}

export function getCustomer(): Customer {
    return {
        ...getGuestCustomer(),
        addresses: [
            getShippingAddress(),
        ],
        isGuest: false,
    };
}
