import { PayPalFastlane, PayPalFastlaneCardComponentMethods } from '../paypal-commerce-types';

export default function getPayPalFastlane(): PayPalFastlane {
    const paypalFastlaneComponentMethods: PayPalFastlaneCardComponentMethods = {
        getPaymentToken: jest.fn(() => Promise.resolve({
            id: 'paypal_fastlane_instrument_id_nonce',
            paymentSource: {
                card: {
                    brand: 'Visa',
                    expiry: '2030-12',
                    lastDigits: '1111',
                    name: 'John Doe',
                    billingAddress: {
                        company: 'BigCommerce',
                        addressLine1: 'addressLine1',
                        addressLine2: 'addressLine2',
                        adminArea1: 'addressCity',
                        adminArea2: 'addressState',
                        postalCode: '03004',
                        countryCode: 'US',
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
            showShippingAddressSelector: jest.fn(),
        },
        FastlaneCardComponent: jest.fn(() => Promise.resolve(paypalFastlaneComponentMethods)),
    };
}
