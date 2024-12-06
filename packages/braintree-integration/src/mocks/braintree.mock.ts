import { PaypalButtonStyleColorOption } from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    DefaultCheckoutButtonHeight,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

export function getBraintreeAcceleratedCheckoutPaymentMethod(): PaymentMethod {
    return {
        id: 'braintreeacceleratedcheckout',
        logoUrl: '',
        method: 'credit-card',
        supportedCards: ['VISA', 'MC', 'AMEX', 'DISCOVER', 'JCB', 'DINERS'],
        config: {
            displayName: 'Credit Card',
            testMode: false,
        },
        clientToken: 'asdasd',
        initializationData: {
            isAcceleratedCheckoutEnabled: false,
        },
        type: 'PAYMENT_TYPE_API',
    };
}

export function getBraintreeLocalMethodsInitializationOptions() {
    return {
        container: '#checkout-payment-continue',
        onRenderButton: jest.fn(),
        submitForm: jest.fn(),
        onValidate: jest.fn(),
        onError: jest.fn(),
    };
}

export function getBraintreeLocalMethods() {
    return {
        id: 'braintreelocalmethods',
        logoUrl: '',
        method: 'ideal',
        supportedCards: [],
        config: {
            displayName: 'Ideal',
            merchantId: 'someMerchantId',
        },
        initializationData: {
            isAcceleratedCheckoutEnabled: false,
            paymentButtonStyles: {
                checkoutTopButtonStyles: {
                    color: PaypalButtonStyleColorOption.BLUE,
                    label: 'checkout',
                    height: DefaultCheckoutButtonHeight,
                },
            },
        },
        type: 'PAYMENT_TYPE_API',
    };
}
