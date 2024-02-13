import { PayPalFastlane, PayPalFastlaneCardComponentMethods } from '../paypal-commerce-types';

export default function getPayPalFastlane(): PayPalFastlane {
    const paypalFastlaneCardComponentMethods: PayPalFastlaneCardComponentMethods = {
        tokenize: jest.fn(() => ({
            nonce: 'paypal_fastlane_tokenize_nonce',
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
        FastlaneCardComponent: jest.fn(() => paypalFastlaneCardComponentMethods),
    };
}
