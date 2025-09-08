import { PaymentMethod } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { PayPalIntent } from '../paypal-types';

export default function getPayPalPaymentMethod(): PaymentMethod {
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
            availableAlternativePaymentMethods: [],
            clientId: 'abc',
            merchantId: 'JTS4DY7XFSQZE',
            orderId: '3U4171152W1482642',
            attributionId: '1123JLKJASD12',
            intent: PayPalIntent.CAPTURE,
            isAcceleratedCheckoutEnabled: false,
            isPayPalCommerceAnalyticsV2Enabled: false,
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
        skipRedirectConfirmationAlert: false,
    };
}

export function getPayPalAcceleratedCheckoutPaymentMethod(): PaymentMethod {
    const paypalDefaultPaymentMethod = getPayPalPaymentMethod();

    return {
        ...paypalDefaultPaymentMethod,
        id: 'paypalcommerceacceleratedcheckout',
        initializationData: {
            ...paypalDefaultPaymentMethod.initializationData,
            isAcceleratedCheckoutEnabled: true,
            shouldRunAcceleratedCheckout: true,
            isPayPalCommerceAnalyticsV2Enabled: true,
        },
    };
}
