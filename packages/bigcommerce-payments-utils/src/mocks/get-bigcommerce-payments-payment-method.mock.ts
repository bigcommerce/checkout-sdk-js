import { PaymentMethod } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { BigCommercePaymentsIntent } from '../bigcommerce-payments-types';

export default function getBigCommercePaymentsPaymentMethod(): PaymentMethod {
    return {
        id: 'bigcommerce_payments_paypal',
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
            intent: BigCommercePaymentsIntent.CAPTURE,
            isAcceleratedCheckoutEnabled: false,
            isBigCommercePaymentsAnalyticsV2Enabled: false,
            isPayPalCreditAvailable: false,
            isVenmoEnabled: false,
            shouldRenderFields: true,
            shouldRunAcceleratedCheckout: false,
            isHostedCheckoutEnabled: false,
            isDeveloperModeApplicable: false,
        },
        type: 'PAYMENT_TYPE_API',
    };
}

export function getBigCommercePaymentsFastlanePaymentMethod(): PaymentMethod {
    const bigCommercePaymentsDefaultPaymentMethod = getBigCommercePaymentsPaymentMethod();

    return {
        ...bigCommercePaymentsDefaultPaymentMethod,
        id: 'bigcommerce_payments_fastlane',
        initializationData: {
            ...bigCommercePaymentsDefaultPaymentMethod.initializationData,
            isAcceleratedCheckoutEnabled: true,
            shouldRunAcceleratedCheckout: true,
            isBigCommercePaymentsAnalyticsV2Enabled: true,
        },
    };
}
