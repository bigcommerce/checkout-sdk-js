import { PaymentMethod } from '@bigcommerce/checkout-sdk/payment-integration-api';

export default function getBigCommerceRatePayPaymentMethod(): PaymentMethod {
    return {
        id: 'ratepay',
        logoUrl: '',
        method: 'bigcommerce', // TODO: double chkeck should iy be bigcommerce_payments_ratepay
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
