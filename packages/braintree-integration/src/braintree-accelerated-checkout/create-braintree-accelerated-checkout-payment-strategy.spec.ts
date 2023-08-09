import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BraintreeAcceleratedCheckoutPaymentStrategy from './braintree-accelerated-checkout-payment-strategy';
import createBraintreeAcceleratedCheckoutPaymentStrategy from './create-braintree-accelerated-checkout-payment-strategy';

describe('createBraintreeAcceleratedCheckoutPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates braintree accelerated checkout payment strategy', () => {
        const strategy =
            createBraintreeAcceleratedCheckoutPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BraintreeAcceleratedCheckoutPaymentStrategy);
    });
});
