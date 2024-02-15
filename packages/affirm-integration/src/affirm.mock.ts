import { PaymentMethod } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { Affirm } from './affirm';

export function getAffirmScriptMock(): Affirm {
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
