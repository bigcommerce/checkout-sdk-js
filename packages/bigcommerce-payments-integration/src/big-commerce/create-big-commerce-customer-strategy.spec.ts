import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommerceCustomerStrategy from './big-commerce-customer-strategy';
import createBigCommerceCustomerStrategy from './create-big-commerce-customer-strategy';

describe('createBigCommerceCustomerStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates bigcommerce commerce customer strategy', () => {
        const strategy = createBigCommerceCustomerStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BigCommerceCustomerStrategy);
    });
});
