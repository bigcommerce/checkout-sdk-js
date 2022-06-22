import { ApplePayPaymentInitializeOptions } from "./initialize-options";
import { PaymentRequestOptions } from "./payment-request-options";

export interface PaymentInitializeOptions extends PaymentRequestOptions {
    /**
     * The options that are required to initialize the Apple Pay payment
     * method. They can be omitted unless you need to support AmazonPay.
     */
    applepay: ApplePayPaymentInitializeOptions;
}
