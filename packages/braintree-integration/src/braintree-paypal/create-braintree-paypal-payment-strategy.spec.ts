import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BraintreePaypalPaymentStrategy from './braintree-paypal-payment-strategy';
import createBraintreePaypalPaymentStrategy from './create-braintree-paypal-payment-strategy';

describe('createBraintreePaypalPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates paypal commerce payment strategy', () => {
        const strategy = createBraintreePaypalPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BraintreePaypalPaymentStrategy);
    });
});
