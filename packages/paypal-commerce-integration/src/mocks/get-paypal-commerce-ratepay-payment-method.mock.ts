import { PaymentMethod } from '@bigcommerce/checkout-sdk/payment-integration-api';

export default function getPayPalCommerceRatePayPaymentMethod(): PaymentMethod {
    return {
        id: 'ratepay',
        logoUrl: '',
        method: 'paypal',
        supportedCards: [],
        clientToken: 'asdcvY7XFSQasd',
        config: {
            testMode: true,
            merchantId: 'JTS4DY7XFSQZE',
        },
        initializationData: {
            clientId: 'abc',
            merchantId: 'JTS4DY7XFSQZE',
            orderId: '3U4171152W1482642',
            attributionId: '1123JLKJASD12',
            intent: 'capture',
        },
        type: 'PAYMENT_TYPE_API',
    };
}
