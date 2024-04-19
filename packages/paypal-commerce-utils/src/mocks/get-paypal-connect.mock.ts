import {
    PayPalCommerceConnect,
    PayPalCommerceConnectCardComponentMethods,
} from '../paypal-commerce-types';

export default function getPayPalConnect(): PayPalCommerceConnect {
    const paypalConnectCardComponentMethods: PayPalCommerceConnectCardComponentMethods = {
        tokenize: jest.fn(() => ({
            nonce: 'paypal_connect_tokenize_nonce',
        })),
        getPaymentToken: jest.fn(() => ({
            id: 'paypal_connect_instrument_id_nonce',
            paymentSource: {
                card: {
                    brand: 'Visa',
                    expiry: '2030-12',
                    lastDigits: '1111',
                    name: 'John Doe',
                    billingAddress: {
                        firstName: 'John',
                        lastName: 'Doe',
                        company: 'BigCommerce',
                        streetAddress: 'addressLine1',
                        extendedAddress: 'addressLine2',
                        locality: 'addressCity',
                        region: 'addressState',
                        postalCode: '03004',
                        countryCodeAlpha2: 'US',
                    },
                },
            },
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
