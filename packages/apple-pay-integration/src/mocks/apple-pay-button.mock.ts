import { CheckoutButtonInitializeOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { getBuyNowCartRequestBody } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { WithApplePayButtonInitializeOptions } from '../apple-pay-button-initialize-options';
import ApplePayButtonMethodType from '../apple-pay-button-method-type';

export function getApplePayButtonInitializationOptions(): CheckoutButtonInitializeOptions &
    WithApplePayButtonInitializeOptions {
    return {
        containerId: 'applePayCheckoutButton',
        methodId: ApplePayButtonMethodType.APPLEPAY,
        applepay: {
            onPaymentAuthorize: jest.fn(),
        },
    };
}

export function getApplePayButtonInitializationOptionsWithBuyNow(): CheckoutButtonInitializeOptions &
    WithApplePayButtonInitializeOptions {
    return {
        containerId: 'applePayCheckoutButton',
        methodId: ApplePayButtonMethodType.APPLEPAY,
        applepay: {
            onPaymentAuthorize: jest.fn(),
            buyNowInitializeOptions: {
                getBuyNowCartRequestBody: jest.fn().mockReturnValue(getBuyNowCartRequestBody()),
            },
            requiresShipping: false,
        },
    };
}
