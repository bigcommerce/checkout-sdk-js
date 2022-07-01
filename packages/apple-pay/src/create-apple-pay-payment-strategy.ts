
import { CustomerWalletButtonStrategy, PaymentIntegrationService, PaymentStrategyNew } from "@bigcommerce/checkout-sdk/payment-integration";
import { RequestSender } from "@bigcommerce/request-sender";
import ApplePayCustomerStrategy from "./apple-pay-customer-strategy";
import ApplePayPaymentStrategy from "./apple-pay-payment-strategy";
import ApplePaySessionFactory from "./apple-pay-session-factory";

export function createApplePayPaymentStrategy(
    requestSender: RequestSender,
    paymentIntegrationService: PaymentIntegrationService
): PaymentStrategyNew {
    return new ApplePayPaymentStrategy(
        requestSender,
        paymentIntegrationService,
        new ApplePaySessionFactory()
    );
}

export function createApplePayCustomerStrategy(
    requestSender: RequestSender,
    paymentIntegrationService: PaymentIntegrationService
): CustomerWalletButtonStrategy {
    return new ApplePayCustomerStrategy(
        requestSender,
        paymentIntegrationService,
        new ApplePaySessionFactory()
    );
}
