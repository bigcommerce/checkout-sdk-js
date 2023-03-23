import { PaymentMethod } from '@bigcommerce/checkout-sdk/payment-integration-api';

export function getBlueSnapDirect(): PaymentMethod {
    return {
        clientToken: 'pfToken',
        config: {
            cardCode: true,
            displayName: 'Credit Card',
            isHostedFormEnabled: true,
            testMode: true,
        },
        gateway: 'bluesnapdirect',
        id: 'credit_card',
        method: 'credit_card',
        supportedCards: ['AMEX', 'CUP', 'DINERS', 'DISCOVER', 'JCB', 'MC', 'VISA'],
        type: 'PAYMENT_TYPE_API',
    };
}
