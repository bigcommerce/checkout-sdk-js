import { PaymentMethod } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { Affirm, AffirmRequestData } from './affirm';

export function getAffirmScriptMock(checkoutMock: jest.Mock): Affirm {
    const checkout = (options: AffirmRequestData) => {
        checkoutMock(options);
    };

    checkout.open = jest.fn();
    checkout.init = jest.fn();

    return {
        checkout,
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
