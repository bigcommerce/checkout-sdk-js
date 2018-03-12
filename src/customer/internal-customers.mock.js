import { getCart } from '../cart/internal-carts.mock';
import { getQuote } from '../quote/internal-quotes.mock';
import { getShippingOptions } from '../shipping/internal-shipping-options.mock';

export function getGuestCustomer() {
    return {
        addresses: [],
        customerGroupId: 0,
        customerGroupName: '',
        customerId: 0,
        email: 'test@bigcommerce.com',
        firstName: 'Foo',
        isGuest: true,
        lastName: 'Bar',
        name: 'Foo Bar',
        phoneNumber: '987654321',
        storeCredit: 0,
    };
}

export function getRemoteCustomer() {
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

export function getCustomerResponseBody() {
    return {
        data: {
            quote: getQuote(),
            customer: getGuestCustomer(),
            cart: getCart(),
            shippingOptions: getShippingOptions(),
        },
        meta: {},
    };
}

export function getCustomerState() {
    return {
        data: getGuestCustomer(),
        meta: {},
    };
}
