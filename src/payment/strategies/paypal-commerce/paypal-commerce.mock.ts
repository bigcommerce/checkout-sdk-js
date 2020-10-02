import { PaypalCommerceSDK } from './paypal-commerce-sdk';

export function getPaypalCommerceMock(): PaypalCommerceSDK {
    return {
        Messages: () => ({
            render: jest.fn(),
        }),
        FUNDING: {
            PAYPAL: 'paypal',
            CREDIT: 'credit',
            PAYLATER: 'paylater',
        },
        Buttons: () => ({
            render: jest.fn(),
            close: jest.fn(),
            isEligible: jest.fn(() => true),
        }),
        HostedFields: {
            isEligible: () => true,
            render: jest.fn(),
        },
    };
}
