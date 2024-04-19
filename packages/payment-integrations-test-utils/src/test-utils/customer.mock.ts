import { Customer, InternalCustomer } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { getAddress } from './address.mock';

export function getCustomer(): Customer {
    return {
        id: 4,
        email: 'test@bigcommerce.com',
        firstName: 'Foo',
        fullName: 'Foo Bar',
        lastName: 'Bar',
        storeCredit: 0,
        shouldEncourageSignIn: false,
        addresses: [
            {
                ...getAddress(),
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

export function getGuestCustomer(): InternalCustomer {
    return {
        addresses: [],
        customerId: 0,
        customerGroupName: '',
        email: 'test@bigcommerce.com',
        firstName: 'Test',
        lastName: 'Tester',
        isGuest: true,
        name: 'Test Tester',
        storeCredit: 0,
    };
}
