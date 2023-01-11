import { PaymentMethod } from '@bigcommerce/checkout-sdk/payment-integration-api';

export function getPayPalCommercePaymentMethod(): PaymentMethod {
    return {
        id: 'paypalcommerce',
        logoUrl: '',
        method: 'paypal',
        supportedCards: [],
        clientToken: 'asdcvY7XFSQasd',
        config: {
            testMode: true,
            merchantId: 'JTS4DY7XFSQZE',
        },
        initializationData: {
            buttonStyle: {
                height: 55,
                color: 'black',
                label: 'pay',
            },
            clientId: 'abc',
            merchantId: 'JTS4DY7XFSQZE',
            orderId: '3U4171152W1482642',
            attributionId: '1123JLKJASD12',
            intent: 'capture',
            isPayPalCreditAvailable: false,
            isVenmoEnabled: false,
            shouldRenderFields: true,
            isHostedCheckoutEnabled: false,
        },
        type: 'PAYMENT_TYPE_API',
    };
}
