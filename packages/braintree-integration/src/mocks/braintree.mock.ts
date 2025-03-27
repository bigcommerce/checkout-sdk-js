import {
    BraintreeThreeDSecure,
    PaypalButtonStyleColorOption,
} from '@bigcommerce/checkout-sdk/braintree-utils';

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

export function getThreeDSecureMock(): BraintreeThreeDSecure {
    return {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        verifyCard: (_options, callback) => {
            if (callback) {
                callback({ code: '' }, { nonce: 'fastlane_token_mock' });
            }

            return Promise.resolve('fastlane_token_mock');
        },
        cancelVerifyCard: jest.fn(),
        on: jest.fn(),
        teardown: jest.fn(),
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
