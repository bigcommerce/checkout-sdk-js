import { PaymentMethod } from '@bigcommerce/checkout-sdk/payment-integration-api';

export function getSquareV2(): PaymentMethod {
    return {
        id: 'squarev2',
        logoUrl: '',
        method: 'credit-card',
        supportedCards: ['VISA', 'MC', 'AMEX', 'DISCOVER', 'JCB', 'DINERS'],
        config: {
            displayName: 'Credit Card',
            cardCode: true,
            enablePaypal: true,
            merchantId: '',
            testMode: true,
            isVisaCheckoutEnabled: false,
        },
        type: 'PAYMENT_TYPE_API',
        initializationData: {
            applicationId: 'test',
            env: 'bar',
            locationId: 'foo',
            paymentData: {
                nonce: undefined,
            },
        },
    };
}
