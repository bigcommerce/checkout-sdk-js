import { PaymentIntegrationService, PaymentIntegrationServiceMock } from "@bigcommerce/checkout-sdk/payment-integration";
import { RequestSender, createRequestSender } from "@bigcommerce/request-sender";
import { createApplePayPaymentStrategy } from ".";
import ApplePayPaymentStrategy from "./apple-pay-payment-strategy";

describe('createApplePayPaymentStrategy', () => {
    let requestSender: RequestSender;
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        requestSender = createRequestSender();
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates apple pay strategy', () => {
        const strategy = createApplePayPaymentStrategy(
            requestSender, paymentIntegrationService
        );
        expect(strategy).toBeInstanceOf(ApplePayPaymentStrategy);
    })
});
