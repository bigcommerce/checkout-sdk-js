import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BraintreePaypalCustomerStrategy from './braintree-paypal-customer-strategy';
import createBraintreePaypalCustomerStrategy from './create-braintree-paypal-customer-strategy';

describe('createBraintreePaypalCustomerStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates paypal commerce customer strategy', () => {
        const strategy = createBraintreePaypalCustomerStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BraintreePaypalCustomerStrategy);
    });
});
