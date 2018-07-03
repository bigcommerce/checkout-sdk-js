import { getQuote } from '../quote/internal-quotes.mock';
import { getShippingAddress } from '../shipping/internal-shipping-addresses.mock';
import { getShippingOptions } from '../shipping/internal-shipping-options.mock';

import CustomerStrategyState from './customer-strategy-state';
import InternalCustomer from './internal-customer';
import { InternalCustomerResponseBody } from './internal-customer-responses';

export function getGuestCustomer(): InternalCustomer {
    return {
        addresses: [],
        customerId: 0,
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
            getShippingAddress(),
        ],
        customerId: 4,
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
            quote: getQuote(),
            customer: getGuestCustomer(),
            shippingOptions: getShippingOptions(),
        },
        meta: {},
    };
}

export function getCustomerStrategyState(): CustomerStrategyState {
    return {
        errors: {},
        statuses: {},
    };
}
