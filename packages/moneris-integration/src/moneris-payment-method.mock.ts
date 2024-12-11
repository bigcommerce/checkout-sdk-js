import { PaymentMethod } from '@bigcommerce/checkout-sdk/payment-integration-api';

export function getMoneris(): PaymentMethod {
    return {
        id: 'moneris',
        gateway: '',
        logoUrl: '',
        method: 'moneris',
        supportedCards: [],
        config: {
            isHostedFormEnabled: false,
            displayName: 'Moneris',
            testMode: false,
        },
        type: 'PAYMENT_TYPE_API',
        initializationData: {
            profileId: 'ABC123',
            creditCardLabel: 'Credit Card',
            expiryDateLabel: 'Expiration Date',
            cvdLabel: 'CVV',
        },
    };
}
