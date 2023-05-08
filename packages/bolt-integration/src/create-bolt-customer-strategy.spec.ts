import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BoltCustomerStrategy from './bolt-customer-strategy';
import createBoltCustomerStrategy from './create-bolt-customer-strategy';

describe('createPayPalCommerceCustomerStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = <PaymentIntegrationService>new PaymentIntegrationServiceMock();
    });

    it('instantiates paypal commerce customer strategy', () => {
        const strategy = createBoltCustomerStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BoltCustomerStrategy);
    });
});
