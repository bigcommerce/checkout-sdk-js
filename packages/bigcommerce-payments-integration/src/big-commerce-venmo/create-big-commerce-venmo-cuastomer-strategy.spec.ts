import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommerceVenmoCustomerStrategy from './big-commerce-venmo-customer-strategy';
import createBigCommerceVenmoCustomerStrategy from './create-big-commerce-venmo-customer-strategy';

describe('createBigCommerceVenmoCustomerStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates bigcommerce venmo customer strategy', () => {
        const strategy = createBigCommerceVenmoCustomerStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BigCommerceVenmoCustomerStrategy);
    });
});
