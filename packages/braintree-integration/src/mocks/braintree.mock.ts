import {
    BraintreeBankAccount,
    BraintreeDataCollector,
    BraintreeModuleCreator,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import { PaymentMethod } from '@bigcommerce/checkout-sdk/payment-integration-api';

export function getBraintree(): PaymentMethod {
    return {
        id: 'braintree',
        logoUrl:
            'https://cdn.bcapp.dev/rHEAD/modules/checkout/braintree/images/paypal_powered_braintree_horizontal.png',
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
        initializationData: {
            isAcceleratedCheckoutEnabled: false,
        },
        type: 'PAYMENT_TYPE_API',
    };
}

export function getBankAccountMock(): BraintreeBankAccount {
    return {
        teardown: jest.fn(() => Promise.resolve()),
        tokenize: jest.fn(() => Promise.resolve({ nonce: 'NONCE', details: {} })),
    };
}

export function getModuleCreatorNewMock<T>(
    module: BraintreeDataCollector,
): BraintreeModuleCreator<T> {
    return {
        create: jest.fn(() => Promise.resolve({ ...module })),
    };
}

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

export function getBraintreeAch(): PaymentMethod {
    return {
        id: 'braintreeach',
        logoUrl: '',
        method: 'paypal-ach',
        supportedCards: [],
        config: {
            displayName: 'Braintree ACH',
            isVaultingEnabled: true,
        },
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
        method: 'giropay',
        supportedCards: [],
        config: {
            displayName: 'Giropay',
        },
        initializationData: {
            isAcceleratedCheckoutEnabled: false,
        },
        type: 'PAYMENT_TYPE_API',
    };
}
