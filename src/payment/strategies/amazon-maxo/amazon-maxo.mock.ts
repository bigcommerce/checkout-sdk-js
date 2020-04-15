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

export function getPaymentMethodMockUndefinedMerchant(): PaymentMethod {
    return Object.assign({}, getPaymentMethodMock(), { config: { merchantId: undefined } });
}

export function getPaymentMethodMock(region = 'us'): PaymentMethod {
    return {
        id: 'amazonpay',
        config: {
            displayName: 'AMAZON PAY',
            helpText: '',
            isVaultingEnabled: false,
            merchantId: 'checkout_amazonpay',
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
            url: 'https://my-dev-store.store.bcdev/remote-checkout/amazonpay/payment-session',
        },
        ledgerCurrency: 'USD' as AmazonMaxoLedgerCurrency,
        merchantId: 'checkout_amazonpay',
        placement: 'Checkout' as AmazonMaxoPlacement,
        productType: 'PayAndShip',
        sandbox: true,
    };
}
