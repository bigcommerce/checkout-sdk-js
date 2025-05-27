import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommercePaymentsVenmoCustomerStrategy from './bigcommerce-payments-venmo-customer-strategy';
import createBigCommercePaymentsVenmoCustomerStrategy from './create-bigcommerce-payments-venmo-customer-strategy';

describe('createBigCommercePaymentsVenmoCustomerStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates BigCommercePayments venmo customer strategy', () => {
        const strategy = createBigCommercePaymentsVenmoCustomerStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BigCommercePaymentsVenmoCustomerStrategy);
    });
});
