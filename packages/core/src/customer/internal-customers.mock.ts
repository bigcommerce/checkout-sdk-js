import { getShippingAddress } from '../shipping/internal-shipping-addresses.mock';

import CustomerStrategyState from './customer-strategy-state';
import InternalCustomer from './internal-customer';
import { InternalCustomerResponseBody } from './internal-customer-responses';

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

export function getCustomer(): InternalCustomer {
    return {
        ...getGuestCustomer(),
        addresses: [
            {
                ...getShippingAddress(),
                id: 5,
            },
        ],
        customerId: 4,
        customerGroupName: 'vip',
        isGuest: false,
        email: 'test@bigcommerce.com',
        firstName: 'Foo',
        lastName: 'Bar',
        name: 'Foo Bar',
    };
}

export function getRemoteCustomer(): InternalCustomer {
    return {
        ...getGuestCustomer(),
        remote: {
            billing: 'fixed',
            billingMessage: 'Same as the Billing address set by you in your Amazon account.',
            customer: 'fixed',
            payment: 'widget',
            provider: 'amazon',
            shipping: 'widget',
        },
    };
}

export function getCustomerResponseBody(): InternalCustomerResponseBody {
    return {
        data: {
            customer: getGuestCustomer(),
        },
        meta: {},
    };
}

export function getCustomerStrategyState(): CustomerStrategyState {
    return {
        data: {},
        errors: {},
        statuses: {},
    };
}
