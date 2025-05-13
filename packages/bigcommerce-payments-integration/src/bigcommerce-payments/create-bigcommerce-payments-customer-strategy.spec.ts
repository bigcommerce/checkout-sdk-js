import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommercePaymentsCustomerStrategy from './bigcommerce-payments-customer-strategy';
import createBigCommercePaymentsCustomerStrategy from './create-bigcommerce-payments-customer-strategy';

describe('createBigCommercePaymentsCustomerStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates BigCommercePayments customer strategy', () => {
        const strategy = createBigCommercePaymentsCustomerStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BigCommercePaymentsCustomerStrategy);
    });
});
