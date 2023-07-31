import { PaypalSDK } from '../paypal';

export function getPaypalSDKMock(): PaypalSDK {
    return {
        FUNDING: {
            CARD: 'card',
            CREDIT: 'credit',
            PAYPAL: 'paypal',
            PAYLATER: 'paylater',
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
