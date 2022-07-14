import PaymentMethod from '../../payment-method';
import { getAmazonPayV2 } from '../../payment-methods.mock';

import { AmazonPayV2ButtonColor, AmazonPayV2ButtonParams, AmazonPayV2CheckoutLanguage, AmazonPayV2LedgerCurrency, AmazonPayV2PayOptions, AmazonPayV2Placement, AmazonPayV2SDK } from './amazon-pay-v2';

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
    const amazonMock = getAmazonPayV2();
    amazonMock.config.merchantId = undefined;

    return amazonMock;
}

export function getPaymentMethodMockUndefinedLedgerCurrency(): PaymentMethod {
    const amazonMock = getAmazonPayV2();
    amazonMock.initializationData.ledgerCurrency = undefined;

    return amazonMock;
}

export function getAmazonPayV2ButtonParamsMock(): AmazonPayV2ButtonParams {
    return {
        buttonColor: AmazonPayV2ButtonColor.Gold,
        checkoutLanguage: AmazonPayV2CheckoutLanguage.en_US,
        createCheckoutSession: {
            url: 'https://my-dev-store.store.bcdev/remote-checkout/amazonpay/payment-session',
            method: 'GET',
            extractAmazonCheckoutSessionId: 'token',
        },
        ledgerCurrency: AmazonPayV2LedgerCurrency.USD,
        merchantId: 'checkout_amazonpay',
        placement: AmazonPayV2Placement.Checkout,
        productType: AmazonPayV2PayOptions.PayAndShip,
        sandbox: true,
    };
}
