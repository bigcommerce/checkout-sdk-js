import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createPayPalCommerceAcceleratedCheckoutCustomerStrategy from './create-paypal-commerce-accelerated-checkout-customer-strategy';
import PayPalCommerceAcceleratedCheckoutCustomerStrategy from './paypal-commerce-accelerated-checkout-customer-strategy';

describe('createPayPalCommerceAcceleratedCheckoutCustomerStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates paypal commerce accelerated checkout customer strategy', () => {
        const strategy =
            createPayPalCommerceAcceleratedCheckoutCustomerStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(PayPalCommerceAcceleratedCheckoutCustomerStrategy);
    });
});
