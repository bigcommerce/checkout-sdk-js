import { CheckoutButtonInitializeOptions, CheckoutButtonMethodType } from '@bigcommerce/checkout-sdk/payment-integration';

export function getApplePayButtonInitializationOptions(): CheckoutButtonInitializeOptions {
    return {
        containerId: 'applePayCheckoutButton',
        methodId: CheckoutButtonMethodType.APPLEPAY,
        applepay: {
            onPaymentAuthorize: jest.fn(),
        },
    };
}
