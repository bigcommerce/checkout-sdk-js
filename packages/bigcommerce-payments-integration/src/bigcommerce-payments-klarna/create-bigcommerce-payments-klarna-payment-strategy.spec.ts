import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommercePaymentsKlarnaPaymentStrategy from './bigcomemrce-payments-klarna-payment-strategy';
import createBigCommercePaymentsKlarnaPaymentStrategy from './create-bigcommerce-payments-klarna-payment-strategy';

describe('createBigCommercePaymentsKlarnaPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates BigCommercePayments klarna payment strategy', () => {
        const strategy = createBigCommercePaymentsKlarnaPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BigCommercePaymentsKlarnaPaymentStrategy);
    });
});
