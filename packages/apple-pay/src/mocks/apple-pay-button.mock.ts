import { CheckoutButtonInitializeOptions, CheckoutButtonMethodType } from '@bigcommerce/checkout-sdk/payment-integration';
import { WithApplePayButtonInitializeOptions } from '../apple-pay-button-initialize-options';

export function getApplePayButtonInitializationOptions(): CheckoutButtonInitializeOptions & WithApplePayButtonInitializeOptions {
    return {
        containerId: 'applePayCheckoutButton',
        methodId: CheckoutButtonMethodType.APPLEPAY,
        applepay: {
            onPaymentAuthorize: jest.fn(),
        },
    };
}
