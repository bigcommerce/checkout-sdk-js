import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BraintreeAcceleratedCheckoutCustomerStrategy from './braintree-accelerated-checkout-customer-strategy';
import createBraintreeAcceleratedCheckoutCustomerStrategy from './create-braintree-accelerated-checkout-customer-strategy';

describe('createBraintreeAcceleratedCheckoutCustomerStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates braintree accelerated checkout customer strategy', () => {
        const strategy =
            createBraintreeAcceleratedCheckoutCustomerStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BraintreeAcceleratedCheckoutCustomerStrategy);
    });
});
