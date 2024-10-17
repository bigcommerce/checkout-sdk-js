import { PaymentMethod } from '@bigcommerce/checkout-sdk/payment-integration-api';

export function getApplePay(): PaymentMethod {
    return {
        id: 'applepay',
        logoUrl: '',
        method: 'credit-card',
        supportedCards: [],
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
