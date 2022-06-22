
import { PaymentIntegrationSelectors, PaymentIntegrationService } from "@bigcommerce/checkout-sdk/payment-integration";
import { RequestSender } from "@bigcommerce/request-sender";
import ApplePayPaymentStrategy from "./apple-pay-payment-strategy";
import ApplePaySessionFactory from "./apple-pay-session-factory";

export function createApplePayPaymentStrategy(
    requestSender: RequestSender,
    paymentIntegrationSelectors: PaymentIntegrationSelectors,
    paymentIntegrationService: PaymentIntegrationService
) {
    return new ApplePayPaymentStrategy(
        requestSender,
        paymentIntegrationSelectors,
        paymentIntegrationService,
        new ApplePaySessionFactory()
    );
}
