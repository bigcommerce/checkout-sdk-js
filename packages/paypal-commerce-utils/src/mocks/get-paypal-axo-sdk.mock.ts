import { PayPalAxoSdk } from '../paypal-commerce-types';

export default function getPayPalAxoSdk(): PayPalAxoSdk {
    return {
        Connect: () =>
            Promise.resolve({
                identity: {
                    lookupCustomerByEmail: jest.fn(),
                    triggerAuthenticationFlow: jest.fn(),
                },
                profile: {
                    showCardSelector: jest.fn(),
                },
                ConnectCardComponent: jest.fn(),
            }),
    };
}
