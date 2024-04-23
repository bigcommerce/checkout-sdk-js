import { PaymentMethod } from '@bigcommerce/checkout-sdk/payment-integration-api';

export function getAfterpay(): PaymentMethod {
    return {
        id: 'PAY_BY_INSTALLMENT',
        gateway: 'afterpay',
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
