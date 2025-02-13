import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BraintreePaypalCreditCustomerStrategy from './braintree-paypal-credit-customer-strategy';
import createBraintreePaypalCreditCustomerStrategy from './create-braintree-paypal-credit-customer-strategy';

describe('createBraintreePaypalCreditCustomerStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates braintree paypal credit customer strategy', () => {
        const strategy = createBraintreePaypalCreditCustomerStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BraintreePaypalCreditCustomerStrategy);
    });
});
