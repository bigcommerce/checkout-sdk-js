import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommercePaymentsPaymentStrategy from './bigcommerce-payments-payment-strategy';
import createBigCommercePaymentsPaymentStrategy from './create-bigcommerce-payments-payment-strategy';

describe('createBigCommercePaymentsPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates BigCommercePayments payment strategy', () => {
        const strategy = createBigCommercePaymentsPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BigCommercePaymentsPaymentStrategy);
    });
});
