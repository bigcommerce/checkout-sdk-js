import { PaymentInitializeOptions } from "@bigcommerce/checkout-sdk/payment-integration-api";

import { CreditCardPaymentInitializeOptions } from "packages/core/src/payment/strategies/credit-card";

export interface PpsdkPaymentInitializeOptions extends PaymentInitializeOptions {
    creditCard?: CreditCardPaymentInitializeOptions;
}