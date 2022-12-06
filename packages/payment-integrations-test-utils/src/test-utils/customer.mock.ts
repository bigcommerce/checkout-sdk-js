import { Customer } from '@bigcommerce/checkout-sdk/payment-integration-api';

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
