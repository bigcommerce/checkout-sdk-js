import PaymentMethod from '../../payment-method';
import { getAmazonPayV2 } from '../../payment-methods.mock';

import { AmazonPayV2ButtonParams, AmazonPayV2CheckoutLanguage, AmazonPayV2LedgerCurrency, AmazonPayV2PayOptions, AmazonPayV2Placement, AmazonPayV2SDK } from './amazon-pay-v2';

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
    return { ...getAmazonPayV2(), config: { merchantId: undefined } };
}

export function getAmazonPayV2ButtonParamsMock(): AmazonPayV2ButtonParams {
    return {
        checkoutLanguage: 'en_US' as AmazonPayV2CheckoutLanguage,
        createCheckoutSession: {
            url: 'https://my-dev-store.store.bcdev/remote-checkout/amazonpay/payment-session',
            method: 'GET',
            extractAmazonCheckoutSessionId: 'token',
        },
        ledgerCurrency: 'USD' as AmazonPayV2LedgerCurrency,
        merchantId: 'checkout_amazonpay',
        placement: 'Checkout' as AmazonPayV2Placement,
        productType: 'PayAndShip' as AmazonPayV2PayOptions,
        sandbox: true,
    };
}
