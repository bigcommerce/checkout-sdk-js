import {
    PayPalAxoSdk,
    PayPalCommerceConnect,
    PayPalCommerceConnectCardComponentMethods,
} from '../paypal-commerce-types';

export default function getPayPalAxoSdk(): PayPalAxoSdk {
    const paypalConnectCardComponentMethods: PayPalCommerceConnectCardComponentMethods = {
        tokenize: jest.fn(() => ({
            nonce: 'paypal_connect_tokenize_nonce',
        })),
        render: jest.fn(),
    };

    const paypalConnectResponse: PayPalCommerceConnect = {
        identity: {
            lookupCustomerByEmail: jest.fn(),
            triggerAuthenticationFlow: jest.fn(),
        },
        profile: {
            showCardSelector: jest.fn(),
        },
        ConnectCardComponent: jest.fn(() => paypalConnectCardComponentMethods),
    };

    return {
        Connect: () => Promise.resolve(paypalConnectResponse),
    };
}
