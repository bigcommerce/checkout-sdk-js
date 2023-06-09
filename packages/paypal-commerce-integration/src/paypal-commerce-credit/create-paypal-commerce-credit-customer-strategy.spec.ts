import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createPaypalCommerceCreditCustomerStrategy from './create-paypal-commerce-credit-customer-strategy';
import PayPalCommerceCreditCustomerStrategy from './paypal-commerce-credit-customer-strategy';

describe('createPayPalCommerceCreditCustomerStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates paypal commerce button strategy', () => {
        const strategy = createPaypalCommerceCreditCustomerStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(PayPalCommerceCreditCustomerStrategy);
    });
});
