import { PaymentMethod } from '@bigcommerce/checkout-sdk/payment-integration-api';

export function getBraintreeAchPaymentMethod(): PaymentMethod {
    return {
        id: 'braintreeach',
        logoUrl: '',
        method: 'paypal-ach',
        clientToken: 'clientToken',
        supportedCards: [],
        config: {
            displayName: 'Braintree ACH',
            isVaultingEnabled: true,
        },
        initializationData: {
            isAcceleratedCheckoutEnabled: false,
        },
        type: 'PAYMENT_TYPE_API',
    };
}
