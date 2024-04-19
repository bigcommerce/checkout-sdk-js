import { PaymentMethod } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { PaypalSDK } from '../paypal-express-types';

export function getPaypalExpress(): PaymentMethod {
    return {
        id: 'paypalexpress',
        logoUrl: '',
        method: 'paypal',
        supportedCards: [],
        config: {
            merchantId: 'h3hxn44tdd8wxkzd',
            testMode: false,
        },
        type: 'PAYMENT_TYPE_API',
    };
}

export function getPaypalExpressMock(): PaypalSDK {
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
