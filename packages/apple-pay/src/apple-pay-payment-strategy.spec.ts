import { InvalidArgumentError, PaymentIntegrationServeMock, PaymentIntegrationService } from "@bigcommerce/checkout-sdk/payment-integration";

import {
    createRequestSender,
    RequestSender,
} from "@bigcommerce/request-sender"
import ApplePayPaymentStrategy from "./apple-pay-payment-strategy";
import ApplePaySessionFactory from "./apple-pay-session-factory";
import { MockApplePaySession } from "./mocks/apple-pay-payment.mock";

describe("ApplePayPaymentStrategy", () => {
    let applePaySession: MockApplePaySession;
    let requestSender: RequestSender;
    let applePayFactory: ApplePaySessionFactory;
    let paymentIntegrationService: PaymentIntegrationService;
    let strategy: ApplePayPaymentStrategy;

    beforeEach(() => {
        applePaySession = new MockApplePaySession();
        Object.defineProperty(window, "ApplePaySession", {
            writable: true,
            value: applePaySession,
        });

        paymentIntegrationService = new PaymentIntegrationServeMock();

        requestSender = createRequestSender();
        applePayFactory = new ApplePaySessionFactory();

        strategy = new ApplePayPaymentStrategy(
            requestSender,
            paymentIntegrationService,
            applePayFactory
        );
    });

    describe("#initialize()", () => {
        it("throws invalid argument error if no method id", async () => {
            await expect(strategy.initialize()).rejects.toBeInstanceOf(
                InvalidArgumentError
            );
        });

        it('initializes the strategy successfully', async () => {
            await strategy.initialize({ methodId: 'applepay' });
            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalled();
        });
    });
});
