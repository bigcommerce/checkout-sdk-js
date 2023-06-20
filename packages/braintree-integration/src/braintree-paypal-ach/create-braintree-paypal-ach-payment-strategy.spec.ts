import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BraintreePaypalAchPaymentStrategy from './braintree-paypal-ach-payment-strategy';
import createBraintreePaypalAchPaymentStrategy from './create-braintree-paypal-ach-payment-strategy';

describe('createBraintreePaypalAchStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates braintree paypal ach payment strategy', () => {
        const strategy = createBraintreePaypalAchPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BraintreePaypalAchPaymentStrategy);
    });
});
