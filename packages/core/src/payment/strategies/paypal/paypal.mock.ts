import { PaypalSDK } from './paypal-sdk';

export function getPaypalMock(): PaypalSDK {
    return {
        FUNDING: {
            CARD: 'card',
            CREDIT: 'credit',
            PAYLATER: 'paylater',
            PAYPAL: 'paypal',
        },
        Button: {
            render: jest.fn(),
        },
        checkout: {
            initXO: jest.fn(),
            startFlow: jest.fn(),
            closeFlow: jest.fn(),
            setup: jest.fn(),
        },
        Buttons: jest.fn(),
        Messages: jest.fn(),
    };
}
