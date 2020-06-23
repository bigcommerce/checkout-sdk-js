import PaymentMethod from '../../payment-method';

import { AmazonPayV2ButtonParams, AmazonPayV2CheckoutLanguage, AmazonPayV2LedgerCurrency, AmazonPayV2Placement, AmazonPayV2SDK } from './amazon-pay-v2';

export function getAmazonPayV2SDKMock(): AmazonPayV2SDK {
    return {
        Pay: {
            renderButton: jest.fn(),
            bindChangeAction: jest.fn(),
            signout: jest.fn(),
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

export function getAmazonPayV2ButtonParamsMock(): AmazonPayV2ButtonParams {
    return {
        checkoutLanguage: 'en_US' as AmazonPayV2CheckoutLanguage,
        createCheckoutSession: {
            url: 'https://my-dev-store.store.bcdev/remote-checkout/amazonpay/payment-session',
        },
        ledgerCurrency: 'USD' as AmazonPayV2LedgerCurrency,
        merchantId: 'checkout_amazonpay',
        placement: 'Checkout' as AmazonPayV2Placement,
        productType: 'PayAndShip',
        sandbox: true,
    };
}
