import { PaypalSDK } from './paypal-sdk';

export function getPaypalMock(): PaypalSDK {
    return {
        Button: {
            render: jest.fn(),
        },
        checkout: {
            initXO: jest.fn(),
            startFlow: jest.fn(),
            closeFlow: jest.fn(),
            setup: jest.fn(),
        },
    };
}
