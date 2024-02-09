import { PaymentMethod } from '@bigcommerce/checkout-sdk/payment-integration-api';

export function getAffirmScriptMock(): unknown {
    return {
        checkout: jest.fn(),
        ui: {
            ready: jest.fn(),
            error: {
                on: jest.fn(),
            },
        },
    };
}

export function getAffirm(): PaymentMethod {
    return {
        id: 'affirm',
        logoUrl: '',
        method: 'affirm',
        supportedCards: [],
        config: {
            testMode: false,
        },
        type: 'PAYMENT_TYPE_API',
        clientToken: 'foo',
    };
}
