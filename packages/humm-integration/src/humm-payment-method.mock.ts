import { PaymentMethod } from '@bigcommerce/checkout-sdk/payment-integration-api';

export function getHumm(): PaymentMethod {
    return {
        id: 'humm',
        logoUrl: '',
        method: 'humm',
        supportedCards: [],
        config: {
            testMode: false,
        },
        type: 'PAYMENT_TYPE_API',
    };
}
