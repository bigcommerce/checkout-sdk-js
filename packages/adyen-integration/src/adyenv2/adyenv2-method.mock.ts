import { PaymentMethod } from "@bigcommerce/checkout-sdk/payment-integration-api";

export function getAdyenV2(method = 'scheme'): PaymentMethod {
    return {
        id: 'adyenv2',
        logoUrl: '',
        method,
        supportedCards: [],
        config: {
            displayName: 'Adyen',
            merchantId: 'YOUR_MERCHANT_ID',
            testMode: true,
        },
        initializationData: {
            originKey: 'YOUR_ORIGIN_KEY',
            clientKey: 'YOUR_CLIENT_KEY',
        },
        type: 'PAYMENT_TYPE_API',
        clientToken: 'clientToken',
    };
}
