import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createStripeCSPaymentStrategy from './create-stripe-cs-payment-strategy';
import StripeCSPaymentStrategy from './stripe-cs-payment-strategy';

describe('createStripeCSPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('create Stripe Checkout Session payment strategy', () => {
        const strategy = createStripeCSPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(StripeCSPaymentStrategy);
    });
});
