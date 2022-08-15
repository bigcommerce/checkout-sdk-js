import { CheckoutButtonInitializeOptions } from "@bigcommerce/checkout-sdk/payment-integration";
import { WithApplePayButtonInitializeOptions } from "../apple-pay-button-initialize-options";
import ApplePayButtonMethodType from "../apple-pay-button-method-type";

export function getApplePayButtonInitializationOptions(): CheckoutButtonInitializeOptions &
    WithApplePayButtonInitializeOptions {
    return {
        containerId: "applePayCheckoutButton",
        methodId: ApplePayButtonMethodType.APPLEPAY,
        applepay: {
            onPaymentAuthorize: jest.fn(),
        },
    };
}
