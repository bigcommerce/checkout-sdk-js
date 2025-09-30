import { PayPalFastlane, PayPalFastlaneCardComponentMethods } from '../paypal-types';

export default function getPayPalFastlane(): PayPalFastlane {
    const paypalFastlaneComponentMethods: PayPalFastlaneCardComponentMethods = {
        // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        getPaymentToken: jest.fn(() => ({
            id: 'paypal_fastlane_instrument_id_nonce',
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
            showShippingAddressSelector: jest.fn(),
        },
        // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        FastlaneCardComponent: jest.fn(() => paypalFastlaneComponentMethods),
    };
}
