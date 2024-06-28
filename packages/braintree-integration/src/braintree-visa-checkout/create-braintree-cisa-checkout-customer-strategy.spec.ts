import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BraintreeVisaCheckoutCustomerStrategy from './braintree-visa-checkout-customer-strategy';
import createBraintreeVisaCheckoutCustomerStrategy from './create-braintree-visa-checkout-customer-strategy';

describe('createBraintreeVisaCheckoutCustomerStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates braintree visa checkout button strategy', () => {
        const strategy = createBraintreeVisaCheckoutCustomerStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BraintreeVisaCheckoutCustomerStrategy);
    });
});
