import { PaymentMethod } from '@bigcommerce/checkout-sdk/payment-integration-api';

export function getCybersource(): PaymentMethod {
    return {
        id: 'cybersource',
        logoUrl: '',
        method: 'credit-card',
        supportedCards: [],
        config: {
            displayName: 'Cybersource',
            is3dsEnabled: true,
            testMode: true,
        },
        type: 'PAYMENT_TYPE_API',
        clientToken: 'cyberToken',
    };
}
