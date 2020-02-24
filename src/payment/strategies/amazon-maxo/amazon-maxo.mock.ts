import PaymentMethod from '../../payment-method';

import { AmazonMaxoButtonParams, AmazonMaxoCheckoutLanguage, AmazonMaxoLedgerCurrency, AmazonMaxoPlacement, AmazonMaxoSDK } from './amazon-maxo';

export function getAmazonMaxoSDKMock(): AmazonMaxoSDK {
    return {
        Pay: {
            renderButton: jest.fn(),
            bindChangeAction: jest.fn(),
        },
    };
}

export function getPaymentMethodMock(region = 'us'): PaymentMethod {
    return {
        id: 'amazonmaxo',
        config: {
            displayName: 'AMAZON MAXO',
            helpText: '',
            isVaultingEnabled: false,
            merchantId: 'checkout_amazonmaxo',
            requireCustomerCode: false,
            testMode: true,
        },
        method: 'method',
        supportedCards: [
            'VISA',
            'AMEX',
            'MC',
        ],
        type: 'PAYMENT_TYPE_API',
        clientToken: 'token',
        nonce: 'nonce',
        initializationData: {
            checkoutLanguage: 'en_US',
            ledgerCurrency: 'USD',
            region,
        },
    };
}

export function getAmazonMaxoButtonParamsMock(): AmazonMaxoButtonParams {
    return {
        checkoutLanguage: 'en_US' as AmazonMaxoCheckoutLanguage,
        createCheckoutSession: {
            url: 'https://my-dev-store.store.bcdev/remote-checkout-token/amazonmaxo',
        },
        ledgerCurrency: 'USD' as AmazonMaxoLedgerCurrency,
        merchantId: 'checkout_amazonmaxo',
        placement: 'Checkout' as AmazonMaxoPlacement,
        productType: 'PayAndShip',
        sandbox: true,
    };
}
