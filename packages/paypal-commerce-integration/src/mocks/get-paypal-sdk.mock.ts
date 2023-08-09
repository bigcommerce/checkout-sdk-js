import { PayPalSDK } from '../paypal-commerce-types';

export default function getPayPalSDKMock(): PayPalSDK {
    return {
        Messages: () => ({
            render: jest.fn(),
        }),
        PaymentFields: () => ({
            render: jest.fn(),
        }),
        FUNDING: {
            CARD: 'card',
            PAYPAL: 'paypal',
            CREDIT: 'credit',
            PAYLATER: 'paylater',
            OXXO: 'oxxo',
            SEPA: 'sepa',
            VENMO: 'venmo',
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        Legal: () => ({
            render: jest.fn(),
        }),
    };
}
