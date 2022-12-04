import { PaymentIntegrationService } from "@bigcommerce/checkout-sdk/payment-integration-api";
import { PaymentIntegrationServiceMock } from "@bigcommerce/checkout-sdk/payment-integrations-test-utils";

import createNoPaymentDataRequiredPaymentStrategy from "./create-no-payment-strategy";
import NoPaymentDataRequiredPaymentStrategy from './no-payment-data-required-strategy';

describe("createNoPaymentDataRequiredPaymentStrategy", () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it("instantiates no payment data required strategy", () => {
        const strategy = createNoPaymentDataRequiredPaymentStrategy(
            paymentIntegrationService
        );

        expect(strategy).toBeInstanceOf(NoPaymentDataRequiredPaymentStrategy);
    });
});
