import { PaymentMethod } from '@bigcommerce/checkout-sdk/payment-integration-api';

export function getClearpay(): PaymentMethod {
    return {
        id: 'PAY_BY_INSTALLMENT',
        gateway: 'clearpay',
        logoUrl: '',
        method: 'multi-option',
        supportedCards: [],
        config: {
            displayName: 'Pay over time',
            merchantId: '33133',
            testMode: false,
        },
        type: 'PAYMENT_TYPE_API',
        clientToken: 'foo',
    };
}
