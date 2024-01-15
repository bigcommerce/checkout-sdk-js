import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createPaypalCommerceAcceleratedCheckoutPaymentStrategy from './create-paypal-commerce-accelerated-checkout-payment-strategy';
import PayPalCommerceAcceleratedCheckoutPaymentStrategy from './paypal-commerce-accelerated-checkout-payment-strategy';

describe('createPayPalCommerceAcceleratedCheckoutPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates paypal commerce accelerated checkout payment strategy', () => {
        const strategy =
            createPaypalCommerceAcceleratedCheckoutPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(PayPalCommerceAcceleratedCheckoutPaymentStrategy);
    });
});
