import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BraintreePaypalPaymentStrategy from './braintree-paypal-payment-strategy';
import createBraintreePaypalCreditPaymentStrategy from './create-braintree-paypal-credit-payment-strategy';

describe('createBraintreePaypalCreditPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates paypal commerce payment strategy', () => {
        const strategy = createBraintreePaypalCreditPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BraintreePaypalPaymentStrategy);
    });
});
