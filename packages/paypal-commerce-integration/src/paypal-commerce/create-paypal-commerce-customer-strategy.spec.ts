import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createPayPalCommerceCustomerStrategy from './create-paypal-commerce-customer-strategy';
import PayPalCommerceCustomerStrategy from './paypal-commerce-customer-strategy';

describe('createPayPalCommerceCustomerStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = <PaymentIntegrationService>new PaymentIntegrationServiceMock();
    });

    it('instantiates paypal commerce customer strategy', () => {
        const strategy = createPayPalCommerceCustomerStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(PayPalCommerceCustomerStrategy);
    });
});
