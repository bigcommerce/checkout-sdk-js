import { PaymentMethod } from '@bigcommerce/checkout-sdk/payment-integration-api';

export default function getBigCommercePaymentMethod(): PaymentMethod {
    return {
        id: 'bigcommerce',
        logoUrl: '',
        method: 'bigcommerce',
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
            paymentButtonStyles: {
                cartButtonStyles: {
                    color: 'black',
                    label: 'checkout',
                },
                pdpButtonStyles: {
                    color: 'black',
                    label: 'checkout',
                },
                checkoutTopButtonStyles: {
                    color: 'silver',
                    label: 'checkout',
                },
                checkoutPaymentButtonStyles: {
                    color: 'black',
                    label: 'pay',
                    height: 55,
                },
            },
            clientId: 'abc',
            merchantId: 'JTS4DY7XFSQZE',
            orderId: '3U4171152W1482642',
            attributionId: '1123JLKJASD12',
            intent: 'capture',
            isAcceleratedCheckoutEnabled: false,
            isPayPalCreditAvailable: false,
            isVenmoEnabled: false,
            shouldRenderFields: true,
            shouldRunAcceleratedCheckout: false,
            isHostedCheckoutEnabled: false,
            paypalBNPLConfiguration: [
                {
                    id: 'checkout',
                    name: 'Checkout page',
                    status: true,
                    styles: {
                        layout: 'text',
                        'logo-type': 'alternative',
                        'text-color': 'white',
                        'text-size': '10',
                    },
                },
                {
                    id: 'cart',
                    name: 'Cart page',
                    status: true,
                    styles: {
                        layout: 'text',
                        'logo-type': 'alternative',
                        'logo-position': 'right',
                        'text-color': 'white',
                        'text-size': '10',
                    },
                },
            ],
        },
        type: 'PAYMENT_TYPE_API',
    };
}
