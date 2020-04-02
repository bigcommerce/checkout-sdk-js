import PaymentMethod from '../../payment-method';

import { AmazonPayv2ButtonParams, AmazonPayv2CheckoutLanguage, AmazonPayv2LedgerCurrency, AmazonPayv2Placement, AmazonPayv2SDK } from './amazon-payv2';

export function getAmazonPayv2SDKMock(): AmazonPayv2SDK {
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

export function getAmazonPayv2ButtonParamsMock(): AmazonPayv2ButtonParams {
    return {
        checkoutLanguage: 'en_US' as AmazonPayv2CheckoutLanguage,
        createCheckoutSession: {
            url: 'https://my-dev-store.store.bcdev/remote-checkout/amazonpay/payment-session',
        },
        ledgerCurrency: 'USD' as AmazonPayv2LedgerCurrency,
        merchantId: 'checkout_amazonpay',
        placement: 'Checkout' as AmazonPayv2Placement,
        productType: 'PayAndShip',
        sandbox: true,
    };
}
