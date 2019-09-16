import { getShippingAddress } from '../shipping/shipping-addresses.mock';

import Customer from './customer';

export function getGuestCustomer(): Customer {
    return {
        id: 0,
        addresses: [],
        email: '',
        firstName: '',
        fullName: '',
        isGuest: true,
        lastName: '',
        storeCredit: 0,
        customerGroup: {
            id: 0,
            name: '',
        },
    };
}

export function getCustomer(): Customer {
    return {
        id: 4,
        email: 'test@bigcommerce.com',
        firstName: 'Foo',
        fullName: 'Foo Bar',
        lastName: 'Bar',
        storeCredit: 0,
        addresses: [
            {
                ...getShippingAddress(),
                id: 5,
                type: 'residential',
            },
        ],
        isGuest: false,
        customerGroup: {
            id: 1,
            name: 'vip',
        },
    };
}

export function getCustomerState() {
    return {
        data: getCustomer(),
    };
}
