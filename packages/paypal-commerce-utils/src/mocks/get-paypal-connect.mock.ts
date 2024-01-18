import {
    PayPalCommerceConnect,
    PayPalCommerceConnectCardComponentMethods,
} from '../paypal-commerce-types';

export default function getPayPalConnect(): PayPalCommerceConnect {
    const paypalConnectCardComponentMethods: PayPalCommerceConnectCardComponentMethods = {
        tokenize: jest.fn(() => ({
            nonce: 'paypal_connect_tokenize_nonce',
        })),
        render: jest.fn(),
    };

    return {
        identity: {
            lookupCustomerByEmail: jest.fn(),
            triggerAuthenticationFlow: jest.fn(),
        },
        events: {
            apmSelected: jest.fn(),
            emailSubmitted: jest.fn(),
            orderPlaced: jest.fn(),
        },
        profile: {
            showCardSelector: jest.fn(),
        },
        ConnectCardComponent: jest.fn(() => paypalConnectCardComponentMethods),
    };
}
