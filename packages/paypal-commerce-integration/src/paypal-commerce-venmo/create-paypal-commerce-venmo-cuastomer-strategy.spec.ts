import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createPaypalCommerceVenmoCustomerStrategy from './create-paypal-commerce-venmo-customer-strategy';
import PayPalCommerceVenmoCustomerStrategy from './paypal-commerce-venmo-customer-strategy';

describe('createPayPalCommerceVenmoCustomerStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates paypal commerce venmo customer strategy', () => {
        const strategy = createPaypalCommerceVenmoCustomerStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(PayPalCommerceVenmoCustomerStrategy);
    });
});
