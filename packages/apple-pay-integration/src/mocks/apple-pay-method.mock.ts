import {
    BraintreeClient,
    BraintreeDataCollector,
    BraintreeModule,
    BraintreeModuleCreator,
} from '../apple-pay';

export function getApplePay() {
    return {
        id: 'applepay',
        logoUrl: '',
        method: 'credit-card',
        supportedCards: [],
        providesShippingAddress: false,
        config: {
            displayName: '',
            helpText: '',
            testMode: false,
            requireCustomerCode: false,
            isVaultingEnabled: false,
            hasDefaultStoredInstrument: false,
            isHostedFormEnabled: false,
        },
        type: 'PAYMENT_TYPE_WALLET',
        initializationStrategy: {
            type: 'not_applicable',
        },
        nonce: undefined,
        initializationData: {
            storeName: 'test store',
            countryCode: 'US',
            currencyCode: 'USD',
            supportedNetworks: ['visa', 'masterCard', 'amex', 'discover'],
            gateway: 'adyenv2',
            merchantCapabilities: ['supports3DS'],
            merchantId: 'abc',
            paymentsUrl: 'https://url',
        },
    };
}

export function getBraintree() {
    return {
        id: 'braintree',
        clientToken: 'clientToken',
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
        type: 'PAYMENT_TYPE_API',
        initializationData: {
            isAcceleratedCheckoutEnabled: false,
            merchantAccountId: '100000',
        },
    };
}

export function getDeviceDataMock(): string {
    return '{"device_session_id": "my_device_session_id", "fraud_merchant_id": "we_dont_use_this_field"}';
}

export function getModuleCreatorMock<T>(
    module?: BraintreeModule | BraintreeClient,
): BraintreeModuleCreator<T> {
    return {
        create: jest.fn(() => Promise.resolve(module || {})),
    };
}

export function getBraintreeDataCollectorMock(): BraintreeDataCollector {
    return {
        deviceData: getDeviceDataMock(),
        teardown: jest.fn(() => Promise.resolve()),
    };
}

export function getBraintreeClientMock(): BraintreeClient {
    return {
        request: jest.fn(),
        getVersion: jest.fn(),
    };
}
