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
                id: '55c96cda6f04c',
            },
        ],
        isGuest: false,
    };
}

export function getCustomerState() {
    return {
        data: getCustomer(),
    };
}
