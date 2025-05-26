import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommercePaymentsPayLaterCustomerStrategy from './bigcommerce-payments-paylater-customer-strategy';
import createBigCommercePaymentsPayLaterCustomerStrategy from './create-bigcommerce-payments-paylater-customer-strategy';

describe('createBigCommercePaymentsPayLaterCustomerStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates BigCommercePayments Paylater button strategy', () => {
        const strategy =
            createBigCommercePaymentsPayLaterCustomerStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BigCommercePaymentsPayLaterCustomerStrategy);
    });
});
