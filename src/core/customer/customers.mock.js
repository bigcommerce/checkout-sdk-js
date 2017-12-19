import { getCart } from '../cart/carts.mock';
import { getQuote } from '../quote/quotes.mock';
import { getShippingOptions } from '../shipping/shipping-options.mock';

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
